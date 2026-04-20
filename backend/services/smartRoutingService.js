/**
 * Routes prompts to specific models based on the selected mode.
 */
function getSmartRouting(mode) {
    const routing = {
        coding: {
            models: ['openai', 'deepseek'],
            systemPrefix: "You are an expert software engineer. Prioritize code quality, security, and performance.",
            label: "Optimized for Coding"
        },
        writing: {
            models: ['gemini', 'openai'], // Assuming Claude isn't here yet, but Gemini/OpenAI are good for writing
            systemPrefix: "You are a creative writer and editor. Focus on style, tone, and engaging narrative.",
            label: "Optimized for Creative Writing"
        },
        research: {
            models: ['gemini', 'meta'],
            systemPrefix: "You are a research assistant. Focus on factual accuracy, citations, and logical structuring.",
            label: "Optimized for Research"
        },
        legal: {
            models: ['openai', 'gemini'],
            systemPrefix: "You are a legal reviewer. Focus on precision, risk detection, and formal language.",
            label: "Optimized for Legal Review"
        },
        general: {
            models: ['openai', 'deepseek', 'meta', 'gemini'],
            systemPrefix: "You are a versatile AI assistant. Provide balanced and helpful responses.",
            label: "Balanced Intelligence"
        }
    };

    return routing[mode] || routing.general;
}

module.exports = { getSmartRouting };
