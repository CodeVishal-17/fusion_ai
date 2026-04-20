const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Evaluates multiple AI responses based on accuracy, clarity, and overall quality.
 */
async function evaluateResponses(prompt, responses) {
    try {
        if (!process.env.OPENAI_API_KEY) return null;

        const validResponses = Object.entries(responses)
            .filter(([_, data]) => data && data.status === "success" && data.text)
            .map(([model, data]) => ({ model, text: data.text }));

        if (validResponses.length === 0) return null;

        const evaluationPrompt = `
        You are a world-class AI quality evaluator.
        Compare the following AI responses to the user's prompt and rank them.
        
        User Prompt: "${prompt}"
        
        Responses:
        ${validResponses.map(r => `--- ${r.model} ---\n${r.text}`).join('\n\n')}
        
        Task:
        1. Score each response (0-10) for Accuracy and Clarity.
        2. Pick the absolute best model.
        3. Provide a brief, brilliant reason why it's the winner.
        
        Return your analysis ONLY in the following JSON format:
        {
            "bestModel": "model_key",
            "reason": "Why this model won",
            "scores": {
                "model_key": { "accuracy": 9.5, "clarity": 9.0 }
            }
        }
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: evaluationPrompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("Evaluator Service Error:", error);
        return null;
    }
}

module.exports = { evaluateResponses };
