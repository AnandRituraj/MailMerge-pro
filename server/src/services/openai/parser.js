/**
 * @file parser.js
 * @description Parser for OpenAI API responses
 */

/**
 * Parse the OpenAI response to extract subject and email content
 * @param {string} content - Raw content from OpenAI response
 * @returns {Object} Parsed subject and email content
 * @throws {Error} If parsing fails
 */
export function parseEmailResponse(content) {
    // Parse subject and email from response
    const subjectMatch = content.match(/SUBJECT:(.*?)(?=\n\n)/s);
    const emailMatch = content.match(/EMAIL:\n([\s\S]+)/);

    if (!subjectMatch || !emailMatch) {
        throw new Error('Failed to parse subject and email content from AI response');
    }

    const subject = subjectMatch[1].trim();
    const emailContent = emailMatch[1].trim();

    return {
        emailContent,
        subject
    };
} 