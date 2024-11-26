import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from the `.env` file
dotenv.config();

// Retrieve sensitive information from environment variables
const API_KEY = process.env.GEMINI_API_KEY; // Gemini API key from .env file
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Discord bot token from .env file

if (!API_KEY || !DISCORD_TOKEN) {
    throw new Error('API_KEY or DISCORD_TOKEN is not set in environment variables.');
}

// Initialize the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Google Gemini API endpoint and model
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta2/generateText';
const MODEL_NAME = 'tunedModels/aidapublic-ozpxoaff5jpo';

// Event: When the bot is ready
client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);
});

// Event: When a message is sent in a server
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    if (message.content.startsWith('!ask')) {
        const userQuery = message.content.replace('!ask', '').trim();

        if (!userQuery) {
            return message.reply('❗ Please provide a query after the "!ask" command.');
        }

        try {
            // Make the request to the Gemini API
            const response = await axios.post(
                `${GEMINI_API_ENDPOINT}?key=${API_KEY}`,
                {
                    model: MODEL_NAME,
                    prompt: { text: userQuery },
                    temperature: 0.7,
                    candidate_count: 1,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const apiResponse = response.data.candidates?.[0]?.output || 'I couldn’t understand that. Please try rephrasing.';
            message.reply(apiResponse);

        } catch (error) {
            // Error handling for API and request issues
            if (error.response) {
                console.error('🚨 Gemini API Error:', error.response.data);
                message.reply(
                    `❗ There was an issue with the Gemini API: ${error.response.data.error?.message || 'Unknown error.'}`
                );
            } else {
                console.error('🚨 Error:', error.message);
                message.reply('❗ Sorry, I couldn’t process your request. Please try again later.');
            }
        }
    }
});

// Log in the Discord bot
client.login(DISCORD_TOKEN);
