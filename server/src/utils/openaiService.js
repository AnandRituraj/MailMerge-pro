import OpenAI from "openai";
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Get API key with fallback option
const apiKey = process.env.OPENAI_API_KEY || '';

// Function to create OpenAI client (lazy initialization)
const getOpenAIClient = () => {
    if (!apiKey) {
        throw new Error('OpenAI API key is missing. Please add it to your .env file (OPENAI_API_KEY=your_key)');
    }

    return new OpenAI({
        apiKey: apiKey,
    });
};

/**
 * Generate personalized email content for a job application
 * @param {Object} data - Job application data
 * @param {string} data.name - Recipient name
 * @param {string} data.email - Recipient email
 * @param {string} data.jobDescription - Job description
 * @param {string} data.companyProfile - Company information
 * @param {string} data.resume - Applicant's resume
 * @returns {Promise<string>} - Generated email content
 */
async function generateEmailContent(data) {
    const { name, jobDescription, companyProfile, resume } = data;

    const prompt = `
Generate a personalized cold email for a job application with the following details:

RECIPIENT:
Name: ${name}
Email: ${data.email}

JOB DESCRIPTION:
${jobDescription}

COMPANY PROFILE:
${companyProfile}

MY RESUME:
${resume}

Instructions:
1. Write a professional cold email addressed to ${name}
2. Keep the email concise, under 250 words
3. Reference specific skills from my resume that match the job description
4. Mention something specific about the company that shows I've done my research
5. Highlight 2-3 key achievements relevant to the role
6. Include a clear call to action (e.g., request for interview)
7. Use a professional tone
8. Format with proper spacing and paragraphs
9. IMPORTANT: DO NOT include any signature, sign-off, or my name at the end of the email
10. DO NOT end with phrases like "Best regards", "Sincerely", "Thanks", etc.
11. End the email with the last sentence of content, without any closing line
12. Do NOT use generic templates or obvious flattery
13. Do NOT include the subject line in your response

Response format: Return just the email body text without any signature, name, or closing line. The email should end with the last content sentence.
`;

    try {
        // Initialize OpenAI client only when needed
        const openai = getOpenAIClient();

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert job application assistant who writes personalized cold emails to recruiters. Your emails are concise, highlight relevant skills and achievements, and show genuine interest in the company. IMPORTANT: Never include any signature, sender name, or standard email closing (like 'Best regards') at the end of emails. The email should end with the last content sentence."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating email content:", error);
        throw new Error(`Failed to generate email content: ${error.message}`);
    }
}

/**
 * Generate email subject line for a job application
 * @param {Object} data - Job application data
 * @param {string} data.jobDescription - Job description
 * @param {string} data.companyProfile - Company information
 * @param {string} data.resume - Applicant's resume
 * @returns {Promise<string>} - Generated subject line
 */
async function generateSubjectLine(data) {
    const { jobDescription, companyProfile, resume } = data;

    const subjectPrompt = `
Generate a compelling subject line for a job application cold email that directly relates to the position and my qualifications.

JOB DESCRIPTION:
${jobDescription}

COMPANY:
${companyProfile}

MY BACKGROUND (brief):
${resume.substring(0, 300)}...

Generate ONLY the subject line text. Make it specific to the position and my qualifications. Keep it under 10 words. Don't include "Subject:" or any other prefix.
`;

    try {
        // Initialize OpenAI client only when needed
        const openai = getOpenAIClient();

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at writing compelling email subject lines for job applications."
                },
                {
                    role: "user",
                    content: subjectPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 50,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating subject line:", error);
        throw new Error(`Failed to generate subject line: ${error.message}`);
    }
}

/**
 * Generate complete email (content and subject) for a job application in a single API call
 * @param {Object} data - Job application data 
 * @returns {Promise<Object>} - Object containing emailContent and subject
 */
async function generateEmail(data) {
    try {
        const { name, jobDescription, companyProfile, resume } = data;

        const prompt = `
Generate a personalized cold email for a job application with the following details:

RECIPIENT:
Name: ${name}
Email: ${data.email}

JOB DESCRIPTION:
${jobDescription}

COMPANY PROFILE:
${companyProfile}

MY RESUME:
${resume}

Use the following structure for the email (this is VERY important):

1. First line should be: "I hope you're doing well."

2. Second paragraph: Express interest in the specific position at the company. For example: 
"I recently came across the [Job Title] opening at [Company Name], and I was excited by the opportunity to contribute to a team pushing the boundaries in [specific domain mentioned in JD, e.g., scalable distributed systems / AI-driven platforms / financial engineering]."

3. Third paragraph: Highlight relevant background and specific skills from the resume that match the job description, with a brief mention of a quantifiable achievement from a recent role. For example:
"With a background in [field] and hands-on experience in [key skills from resume relevant to JD], I believe I can bring immediate value to your team. During my recent [role/project] at [Company/Organization], I [quantifiable impact or technical highlight]."

4. Include something specific about the company: "I'm particularly drawn to [mention something specific about the company/team/mission from the JD or research] and would love to be part of that journey."

5. Closing paragraph: "I've attached my resume for your reference. I'd truly appreciate the opportunity to connect and explore how my background could align with your current needs."

6. Final line: Use a professional closing phrase such as "Best regards," "Sincerely," "Thanks for your time and consideration," "Kind regards," etc. Vary the closing phrases for different emails to sound more natural.

Instructions:
1. First provide a SHORT, compelling subject line that directly relates to the position and qualifications
2. Then write a professional cold email following EXACTLY the structure provided above
3. Keep the email concise
4. Make sure to identify specific skills from the resume that directly match requirements in the job description
5. Mention something specific about the company that shows genuine interest
6. Use a professional tone with proper spacing between paragraphs
7. DO NOT include your name after the closing phrase - the signature will be added separately
8. DO NOT use generic templates or obvious flattery

Response format:
SUBJECT: [Your compelling subject line here]

EMAIL:
[Your email content here following the exact structure provided above]
`;

        // Initialize OpenAI client only when needed
        const openai = getOpenAIClient();

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert job application assistant who writes personalized cold emails to recruiters. You must follow the exact email structure provided. Focus on specific skills matching between the resume and job description, with clear examples showing how the applicant's experience meets the job requirements. Create emails that highlight relevant qualifications, demonstrate knowledge of the company, and show genuine interest."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        const content = response.choices[0].message.content.trim();

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
    } catch (error) {
        console.error('Error generating email:', error);
        throw new Error(`Failed to generate email: ${error.message}`);
    }
}

export default {
    generateEmail,
    generateEmailContent,
    generateSubjectLine
}; 