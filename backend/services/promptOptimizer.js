const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Refines a user prompt for better AI results.
 */
async function optimizePrompt(prompt) {
    try {
        if (!prompt) return prompt;

        const systemPrompt = `
        You are an expert Prompt Engineer. 
        Your task is to take a simple user prompt and expand it into a detailed, high-quality instruction that will yield better results from LLMs.
        - Add structure
        - Define tone and audience
        - Specify output format
        - Keep it concise but powerful
        
        Return ONLY the optimized prompt text. No preamble.
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ]
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Prompt Optimizer Error:", error);
        return prompt;
    }
}

module.exports = { optimizePrompt };
