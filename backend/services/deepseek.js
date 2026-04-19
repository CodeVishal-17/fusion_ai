const { performance } = require('perf_hooks');
const { OpenAI } = require('openai');
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://models.inference.ai.azure.com'
});

async function callDeepseek(messages) {
    const startTime = performance.now();
    try {
        if (!process.env.DEEPSEEK_API_KEY) throw new Error("Missing DEEPSEEK_API_KEY");

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini", // Guaranteed multimodal mapping on Azure
            messages: messages,
        });
        const time = Math.round(performance.now() - startTime);
        const text = response.choices[0].message.content;
        const tokens = Math.round(text.length / 4);
        return { text, time, tokens, status: "success" };
    } catch (error) {
        console.error("Deepseek/Azure Error:", error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Error: ${error.message}`, time, tokens: 0, status: "error" };
    }
}
module.exports = { callDeepseek };
