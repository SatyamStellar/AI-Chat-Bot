
import { config } from 'dotenv';
import readline from 'readline/promises';
import { GoogleGenAI } from "@google/genai";

config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const chatHistory = [];

async function chatLoop() {
    try {
        const userInput = await rl.question('You: ');

        chatHistory.push({
            role: "user",
            parts: [{ text: userInput, type: "text" }]
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: chatHistory,
        });

        const responseText = response.candidates[0].content.parts[0].text;

        chatHistory.push({
            role: "model",
            parts: [{ text: responseText, type: "text" }]
        });

        console.log(`AI: ${responseText}`);

        chatLoop();
    } catch (error) {
        console.error("An error occurred:", error);
        rl.close();
    }
}

console.log("AI Chat App - Type 'exit' to quit\n");
chatLoop();

rl.on('close', () => {
    console.log("\nGoodbye!");
    process.exit(0);
});
