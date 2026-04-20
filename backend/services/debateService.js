const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Resolves factual disagreements between multiple AI models.
 */
async function resolveDisagreement(prompt, responses) {
    try {
        if (!process.env.OPENAI_API_KEY) return null;

        const validResponses = Object.entries(responses)
            .filter(([_, data]) => data && data.text)
            .map(([model, data]) => ({ model, text: data.text }));

        const resolutionPrompt = `
        You are a supreme AI Arbiter. Multiple AI models disagree on the answer to a user's prompt.
        Your job is to investigate their claims, identify the factual truth, and provide a definitive resolution.
        
        User Prompt: "${prompt}"
        
        Conflicting Responses:
        ${validResponses.map(r => `--- ${r.model} ---\n${r.text}`).join('\n\n')}
        
        Task:
        1. Identify exactly where the models disagree.
        2. Verify the correct information (if possible with your internal knowledge).
        3. Provide a single, final "Source of Truth" answer that resolves the conflict.
        4. Be authoritative and clear.
        
        Return your response in high-quality Markdown.
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: resolutionPrompt }]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Debate Service Error:", error);
        return "I was unable to resolve the disagreement at this time.";
    }
}

module.exports = { resolveDisagreement };
