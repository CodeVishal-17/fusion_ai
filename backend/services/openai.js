const { performance } = require('perf_hooks');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

const officialOpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function callOpenAI(messages, apiKey = null) {
    const startTime = performance.now();
    try {
        const key = apiKey || process.env.OPENAI_API_KEY;
        if (!key) throw new Error("Missing OPENAI_API_KEY");
        
        const client = new OpenAI({
            apiKey: key,
            baseURL: apiKey ? undefined : "https://models.inference.ai.azure.com",
        });

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
        });
        const time = Math.round(performance.now() - startTime);
        const text = response.choices[0].message.content;
        const tokens = Math.round(text.length / 4);
        return { text, time, tokens, status: "success" };
    } catch (error) {
        console.error("OpenAI Error:", error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Error: ${error.message}`, time, tokens: 0, status: "error" };
    }
}

async function generateImageDALLE(prompt) {
    const startTime = performance.now();
    try {
        if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
        
        // Use official client for DALL-E 3
        const response = await officialOpenAI.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
        });

        const time = Math.round(performance.now() - startTime);
        return { 
            text: `![Generated Image](${response.data[0].url})`, 
            imageUrl: response.data[0].url,
            time, 
            tokens: 100, 
            status: "success",
            isImage: true 
        };
    } catch (error) {
        console.error("DALL-E Error:", error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Image Generation Error: ${error.message}`, time, tokens: 0, status: "error" };
    }
}

module.exports = { callOpenAI, generateImageDALLE };
