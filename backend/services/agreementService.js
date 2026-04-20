const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Detects similarity and agreement between multiple AI responses.
 */
async function detectAgreement(prompt, responses) {
    try {
        if (!process.env.OPENAI_API_KEY) return null;

        const validResponses = Object.entries(responses)
            .filter(([_, data]) => data && data.status === "success" && data.text)
            .map(([model, data]) => ({ model, text: data.text }));

        if (validResponses.length <= 1) return { agreementPercentage: 100, disagreement: false };

        const agreementPrompt = `
        Compare these AI responses for similarity and factual consistency.
        
        User Prompt: "${prompt}"
        
        Responses:
        ${validResponses.map(r => `--- ${r.model} ---\n${r.text}`).join('\n\n')}
        
        Task:
        1. Calculate an agreement percentage (0-100) based on how much they agree on facts and approach.
        2. Set "disagreement" to true if there are major factual contradictions.
        
        Return your analysis ONLY in the following JSON format:
        {
            "agreementPercentage": 85,
            "disagreement": false,
            "consensusSummary": "All models agree on X, but Y differs slightly."
        }
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: agreementPrompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("Agreement Service Error:", error);
        return { agreementPercentage: 0, disagreement: false };
    }
}

module.exports = { detectAgreement };
