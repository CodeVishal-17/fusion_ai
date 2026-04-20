const Chat = require('../models/Chat');
const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Generates a concise, catchy title for a chat session based on the prompt.
 */
async function generateTitle(prompt) {
    try {
        if (!process.env.OPENAI_API_KEY) return "New Conversation";

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Generate a extremely concise 3-5 word title for the following AI prompt. Do not use quotes or punctuation. Return ONLY the title text." },
                { role: "user", content: prompt }
            ]
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Memory Service Error (Title):", error);
        return "Chat Session";
    }
}

/**
 * Injects user personality/preferences into the system prompt.
 */
function getMemoryPrompt(user) {
    if (!user || !user.preferences || !user.preferences.memoryEnabled) return "";
    
    return `
    --- USER PROFILE & MEMORY ---
    Preferred Tone: ${user.preferences.tone}
    Expertise Level: ${user.preferences.expertise}
    Always remember these preferences when crafting your response.
    `;
}

module.exports = { generateTitle, getMemoryPrompt };
