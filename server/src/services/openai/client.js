/**
 * @file client.js
 * @description OpenAI client initialization and management
 */

import OpenAI from "openai";
import config from '../../config/config.js';

/**
 * Create OpenAI client with lazy initialization
 * @returns {OpenAI} OpenAI client instance
 */
export function getOpenAIClient() {
    const apiKey = config.openai.apiKey;

    if (!apiKey) {
        throw new Error('OpenAI API key is missing. Please add it to your .env file (OPENAI_API_KEY=your_key)');
    }

    return new OpenAI({
        apiKey: apiKey,
    });
} 