const { OpenAI } = require('openai');
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

async function analyzeResponses(prompt, responses) {
    try {
        if (!process.env.OPENAI_API_KEY) return null;

        const evaluationPrompt = `
        You are an expert AI evaluator and synthesis engineer. 
        Compare the following AI responses to the user's prompt.
        
        User Prompt: "${prompt}"
        
        Responses:
        ${Object.entries(responses).map(([model, data]) => `--- ${model} ---\n${data.text}`).join('\n\n')}
        
        Task:
        1. Rank the responses and pick the absolute best one.
        2. Identify common points and contradictions.
        3. Create an "Ultimate Synthesis" Master Response. This should be a highly professional, comprehensive, and perfectly formatted markdown response that combines the absolute best parts of all models while correcting any errors.
        
        Return your analysis ONLY in the following JSON format:
        {
            "bestModel": "model_key",
            "bestReason": "Reason why it is best",
            "commonPoints": ["point 1", "point 2"],
            "keyDifferences": ["diff 1", "diff 2"],
            "consensus": "A short 1-2 sentence summary of the group intelligence",
            "ultimateSynthesis": "The full Master Response in high-quality Markdown"
        }
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: evaluationPrompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("Analysis Error:", error);
        return null;
    }
}

async function improvePrompt(prompt) {
    try {
        if (!process.env.OPENAI_API_KEY) return prompt;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a prompt engineer. Improve the following user prompt to get better AI responses. Keep it concise but add necessary context and instructions. Return ONLY the improved prompt text." },
                { role: "user", content: prompt }
            ]
        });

        return response.choices[0].message.content;
    } catch (error) {
        return prompt;
    }
}

module.exports = { analyzeResponses, improvePrompt };
