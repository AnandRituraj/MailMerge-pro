/**
 * @file config.js
 * @description Application configuration manager for MailMerge Pro.
 * 
 * This file centralizes all application configuration including:
 * - Server port settings
 * - API keys and credentials
 * - CORS configuration
 * - File path definitions
 * - Environment-specific settings
 * 
 * The configuration is loaded from environment variables and organized
 * into a structured object that can be imported throughout the application.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    port: process.env.PORT || 5000,
    aiModePassword: process.env.AI_MODE_PASSWORD,
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
    },
    cors: {
        origins: [
            'http://localhost:3000',                // Local development
            'https://mailmerge-pro.vercel.app',     // Primary Vercel domain
            /\.vercel\.app$/                        // Any Vercel subdomain
        ],
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    },
    paths: {
        uploadsDir: path.join(__dirname, '../../../uploads')
    }
};

export default config; 