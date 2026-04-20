const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Generates a unified, optimized answer by combining the best parts of all model responses.
 */
async function generateSummary(prompt, responses) {
    try {
        if (!process.env.OPENAI_API_KEY) return null;

        const validResponses = Object.entries(responses)
            .filter(([_, data]) => data && data.status === "success" && data.text)
            .map(([model, data]) => ({ model, text: data.text }));

        if (validResponses.length === 0) return null;

        const summaryPrompt = `
        You are a Synthesis Engineer. Your job is to create the "Ultimate AI Fusion Answer".
        Combine the absolute best insights from all models into one perfect, comprehensive, and perfectly formatted response.
        
        User Prompt: "${prompt}"
        
        Model Responses:
        ${validResponses.map(r => `--- ${r.model} ---\n${r.text}`).join('\n\n')}
        
        Task:
        1. Correct any errors found in individual responses.
        2. Combine unique insights from different models.
        3. Format using high-quality Markdown (headings, lists, code blocks).
        4. Make it feel like the most intelligent answer possible.
        
        Return ONLY the full Markdown synthesis. No preamble.
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: summaryPrompt }]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Summary Service Error:", error);
        return null;
    }
}

module.exports = { generateSummary };
