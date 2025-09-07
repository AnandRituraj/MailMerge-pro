/**
 * @file index.js
 * @description Main entry point for OpenAI service
 */

import { getOpenAIClient } from './client.js';
import { createEmailPrompt, getSystemMessage } from './prompts.js';
import { parseEmailResponse } from './parser.js';

/**
 * Generate complete email (content and subject) for a job application in a single API call
 * @param {Object} data - Job application data 
 * @returns {Promise<Object>} - Object containing emailContent and subject
 */
export async function generateEmail(data) {
	try {
		// Initialize OpenAI client
		const openai = getOpenAIClient();

		// Create prompt
		const prompt = createEmailPrompt(data);

		// Get system message
		const systemMessage = getSystemMessage();

		// Make API call using Responses API (required for newer models like gpt-5-mini)
		const response = await openai.responses.create({
			model: "gpt-5-mini",
			input: [
				{ role: "system", content: systemMessage },
				{ role: "user", content: prompt }
			]
		});

		// Prefer Responses API output, fall back to Chat Completions shape just in case
		const content = (response.output_text || response.choices?.[0]?.message?.content || "").trim();

		// Parse response
		return parseEmailResponse(content);
	} catch (error) {
		console.error('Error generating email:', error);
		throw new Error(`Failed to generate email: ${error.message}`);
	}
}