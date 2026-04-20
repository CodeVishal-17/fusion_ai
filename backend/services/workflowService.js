const { callOpenAI } = require('./openai');
const { callDeepseek } = require('./deepseek');
const { callGemini } = require('./gemini');
const { callMeta } = require('./meta');
const User = require('../models/User');

const modelFunctions = {
    'openai': callOpenAI,
    'deepseek': callDeepseek,
    'gemini': callGemini,
    'meta': callMeta
};

/**
 * Executes a multi-step AI workflow.
 */
async function executeWorkflow(userId, workflowSteps, initialPrompt) {
    try {
        const user = await User.findById(userId);
        let currentContext = initialPrompt;
        const results = [];

        for (const step of workflowSteps) {
            const modelName = step.model || 'openai';
            const apiCallFunc = modelFunctions[modelName] || callOpenAI;
            const userKey = user.apiKeys?.[modelName];

            const stepPrompt = `
            Task: ${step.instruction}
            Input/Context from previous steps: ${currentContext}
            `;

            const msgs = [{ role: "user", content: stepPrompt }];
            
            // Execute the model for this step
            const res = await apiCallFunc(msgs, userKey);
            
            if (res.status === 'success') {
                results.push({ 
                    step: step.order, 
                    model: modelName, 
                    instruction: step.instruction,
                    answer: res.text 
                });
                currentContext = res.text; // Pass output to next step
            } else {
                throw new Error(`Step ${step.order} (${modelName}) failed: ${res.text}`);
            }
        }

        return { results, finalAnswer: currentContext };
    } catch (error) {
        console.error("Workflow Service Error:", error);
        throw error;
    }
}

module.exports = { executeWorkflow };
