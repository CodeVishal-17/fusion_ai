const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Executes a multi-step AI workflow.
 */
async function executeWorkflow(userId, workflow, initialPrompt) {
    try {
        let currentContext = initialPrompt;
        const results = [];

        for (const step of workflow.steps) {
            const stepPrompt = `
            Step Type: ${step.type}
            Instruction: ${step.instruction}
            Context: ${currentContext}
            `;

            const response = await client.chat.completions.create({
                model: "gpt-4o", // Use GPT-4o as orchestrator or specified model
                messages: [{ role: "system", content: stepPrompt }]
            });

            const answer = response.choices[0].message.content;
            results.push({ step: step.type, answer });
            currentContext = answer; // Chain context to next step
        }

        return { results, finalAnswer: currentContext };
    } catch (error) {
        console.error("Workflow Service Error:", error);
        throw error;
    }
}

module.exports = { executeWorkflow };
