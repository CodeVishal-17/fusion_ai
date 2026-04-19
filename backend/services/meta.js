const { performance } = require('perf_hooks');
const { OpenAI } = require('openai');
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

async function callMeta(messages) {
    const startTime = performance.now();
    try {
        if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

        // Meta Llama 3 on Groq is typically text-only. 
        // If the payload has array content for images, flatten it.
        const textOnlyMessages = messages.map(msg => {
            if (typeof msg.content === 'string') return msg;
            if (Array.isArray(msg.content)) {
                return { ...msg, content: msg.content.filter(c => c.type === 'text').map(c => c.text).join('\n') };
            }
            return msg;
        });

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: textOnlyMessages,
        });
        const time = Math.round(performance.now() - startTime);
        const text = response.choices[0].message.content;
        const tokens = Math.round(text.length / 4);
        return { text, time, tokens, status: "success" };
    } catch (error) {
        console.error("Meta Error:", error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Error: ${error.message}`, time, tokens: 0, status: "error" };
    }
}
module.exports = { callMeta };
