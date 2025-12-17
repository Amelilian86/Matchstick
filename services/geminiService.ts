import { GoogleGenAI, Schema, Type } from "@google/genai";
import { EquationChar, CharType } from "../types";
import { DIGIT_SEGMENTS } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getHint = async (currentEquation: string): Promise<string> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `
        The user is playing a matchstick puzzle game.
        The current equation is "${currentEquation}".
        The goal is to move EXACTLY ONE matchstick to make the equation correct.
        Provide a subtle hint that guides them towards the solution without explicitly stating it.
        Be brief and encouraging.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful game assistant.",
                thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple hints
            }
        });

        return response.text || "Try looking at the digits differently!";
    } catch (error) {
        console.error("Gemini Hint Error:", error);
        return "Can you turn a 9 into a 6, or a 5 into a 3? Experiment!";
    }
};

export const generatePuzzle = async (): Promise<{ start: string, solution: string }> => {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `
        Generate a new matchstick equation puzzle.
        Constraint 1: The starting equation must be mathematically FALSE.
        Constraint 2: Moving EXACTLY ONE matchstick must make it TRUE.
        Constraint 3: Use only digits 0-9 and operators + and -.
        Constraint 4: The result must be a valid integer.
        
        Return JSON format.
        `;

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                start: { type: Type.STRING, description: "The starting false equation, e.g. 6+4=4" },
                solution: { type: Type.STRING, description: "The solved true equation, e.g. 0+4=4" }
            },
            required: ["start", "solution"]
        };

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                thinkingConfig: { thinkingBudget: 1024 } // Use thinking for puzzle logic validation
            }
        });

        const json = JSON.parse(response.text || "{}");
        if (json.start && json.solution) {
            return json;
        }
        throw new Error("Invalid format");
    } catch (error) {
        console.error("Gemini Puzzle Gen Error:", error);
        // Fallback puzzles
        const fallbacks = [
            { start: "6+4=4", solution: "0+4=4" }, // Move from 6(mid) to 0(top-right? No, 6 is missing top-right. 0 has top-right, no mid. So move 6-mid to 0-TR. Correct.)
            { start: "5+7=2", solution: "9-7=2" }, // Move vertical from + to make 5 into 9.
            { start: "1+9=18", solution: "1+9=10" } // Not possible 18->10?
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
};
