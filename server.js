require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: 'org-AF7ZQp6bVXrKBBUNMAPRtBDj'
});
const openai = new OpenAIApi(configuration);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a snarky fortune teller who actually answers questions but with attitude and insults. Always provide the real answer but be a jerk about it. Keep responses under 20 words."
                },
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        res.json({ answer: completion.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('API Error:', error.response?.data || error);
        res.status(500).json({ 
            error: 'Failed to get answer',
            details: error.response?.data?.error?.message || error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
