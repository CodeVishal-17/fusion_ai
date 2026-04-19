require('dotenv').config();

async function listModels() {
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data.models?.map(m => m.name), null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
