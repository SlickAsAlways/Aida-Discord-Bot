import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from a `.env` file
dotenv.config();

// Set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Gemini API endpoint
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta2/tunedModels/aidapublic-ozpxoaff5jpo:generateText';

// Retrieve sensitive information from environment variables
const API_KEY = process.env.GEMINI_API_KEY; // Set your Gemini API key in the `.env` file
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Set your Discord bot token in the `.env` file

if (!API_KEY || !DISCORD_TOKEN) {
    throw new Error('API_KEY or DISCORD_TOKEN is not set in environment variables.');
}

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // For general server interactions
        GatewayIntentBits.GuildMessages, // For listening to messages in servers
        GatewayIntentBits.MessageContent, // For reading the content of messages
    ],
});

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
                `${GEMINI_API_ENDPOINT}?key=${API_KEY}`, // Add API key in URL as query parameter
                {
                    prompt: { text: userQuery }, // Prompt object format
                    temperature: 0.7, // Controls randomness of responses
                    candidate_count: 1, // Only return 1 response candidate
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            // Check if response contains valid output
            const apiResponse =
                response.data.candidates?.[0]?.output || 'I couldn’t understand that. Please try rephrasing.';
            message.reply(apiResponse);

        } catch (error) {
            // Enhanced error handling for API and request issues
            if (error.response) {
                // Detailed error response from Gemini API
                console.error('🚨 Gemini API Error:', error.response.data);
                message.reply(
                    `❗ There was an issue with the Gemini API: ${error.response.data.error?.message || 'Unknown error.'}`
                );
            } else if (error.request) {
                // If the request was made but no response was received
                console.error('🚨 No response received:', error.request);
                message.reply('❗ Sorry, no response was received from the Gemini API.');
            } else {
                // General error handling (e.g., issues in your code)
                console.error('🚨 Error:', error.message);
                message.reply('❗ Sorry, I couldn’t process your request. Please try again later.');
            }
        }
    }
});

// Log in the Discord bot
client.login(DISCORD_TOKEN);
