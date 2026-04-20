const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Knowledge = require('../models/Knowledge');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});

/**
 * Chunks text and generates embeddings for RAG.
 */
async function processDocument(userId, file) {
    try {
        let text = '';
        if (file.mimetype === 'application/pdf') {
            const data = await pdf(file.buffer);
            text = data.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const data = await mammoth.extractRawText({ buffer: file.buffer });
            text = data.value;
        } else {
            text = file.buffer.toString('utf-8');
        }

        // Chunking (simple 1000 char overlap)
        const chunkSize = 1000;
        const overlap = 200;
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize - overlap) {
            chunks.push(text.slice(i, i + chunkSize));
        }

        // Generate embeddings for each chunk sequentially to avoid rate limits
        const processedChunks = [];
        for (const chunk of chunks) {
            try {
                const response = await client.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunk,
                });
                processedChunks.push({
                    text: chunk,
                    embedding: response.data[0].embedding
                });
                // Small delay to be safe with rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
                console.error("Chunk processing error:", err.message);
                // Continue with other chunks if one fails, or could throw
            }
        }

        if (processedChunks.length === 0) {
            throw new Error("Failed to process any chunks from the document.");
        }

        const knowledge = await Knowledge.create({
            userId,
            fileName: file.originalname,
            fileType: file.mimetype,
            chunks: processedChunks
        });

        return knowledge;
    } catch (error) {
        console.error("Knowledge Service Error:", error);
        throw error;
    }
}

/**
 * Retrieves relevant context based on user query.
 */
async function getRelevantContext(userId, query) {
    try {
        // Generate embedding for query
        const queryResponse = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = queryResponse.data[0].embedding;

        // Find all knowledge for user
        const knowledgeBases = await Knowledge.find({ userId });
        if (!knowledgeBases.length) return "";

        const allChunks = knowledgeBases.flatMap(kb => kb.chunks);
        
        // Simple cosine similarity sort
        const similarities = allChunks.map(chunk => {
            const dotProduct = chunk.embedding.reduce((acc, val, i) => acc + val * queryEmbedding[i], 0);
            return { text: chunk.text, score: dotProduct };
        });

        const topChunks = similarities
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(c => c.text);

        return topChunks.join("\n\n");
    } catch (error) {
        console.error("Context Retrieval Error:", error);
        return "";
    }
}

module.exports = { processDocument, getRelevantContext };
