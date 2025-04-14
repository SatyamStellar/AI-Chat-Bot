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

const aiName = "Satyam";

function isNameQuestion(input) {
    const lowerInput = input.toLowerCase();
    return (
        lowerInput.includes("your name") ||
        lowerInput.includes("who are you") ||
        lowerInput.includes("what's your name")
    );
}

function isCapabilityQuestion(input) {
    const lowerInput = input.toLowerCase();
    return (
        lowerInput.includes("what can you do") ||
        lowerInput.includes("what you can do") ||
        lowerInput.includes("your capabilities")
    );
}

async function chatLoop() {
    try {
        const userInput = await rl.question('You: ');

        if (userInput.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        if (isNameQuestion(userInput)) {
            const responseText = `My name is ${aiName}!`;
            console.log(`AI: ${responseText}`);
            chatHistory.push(
                {
                    role: "user",
                    parts: [{ text: userInput, type: "text" }],
                },
                {
                    role: "model",
                    parts: [{ text: responseText, type: "text" }],
                }
            );
            return chatLoop();
        }

        if (isCapabilityQuestion(userInput)) {
            const responseText = `I'm ${aiName}, and I can answer questions, help with coding, provide advice, and more. Just ask me anything!`;
            console.log(`AI: ${responseText}`);
            chatHistory.push(
                {
                    role: "user",
                    parts: [{ text: userInput, type: "text" }],
                },
                {
                    role: "model",
                    parts: [{ text: responseText, type: "text" }],
                }
            );
            return chatLoop();
        }

        chatHistory.push({
            role: "user",
            parts: [{ text: userInput, type: "text" }],
        });

        const contentsToSend = [
            {
                role: "model",
                parts: [{
                    text: `I am an AI named ${aiName}. If asked about my identity or name, I respond with "My name is ${aiName}" or similar.`
                }],
            },
            ...chatHistory,
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contentsToSend,
        });

        const responseText = response.candidates[0].content.parts[0].text;

        chatHistory.push({
            role: "model",
            parts: [{ text: responseText, type: "text" }],
        });

        console.log(`AI: ${responseText}`);

        chatLoop();
    } catch (error) {
        console.error("Error:", error.message);
        console.log("Let’s try again...");
        chatLoop();
    }
}

console.log("AI Chat App - Type 'exit' to quit\n");
chatLoop();

rl.on('close', () => {
    console.log("\nGoodbye!");
    process.exit(0);
});

