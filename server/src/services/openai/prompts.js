/**
 * @file prompts.js
 * @description Email generation prompt templates
 */

/**
 * Generate the email prompt based on provided data
 * @param {Object} data - Job application data
 * @returns {string} Formatted prompt for email generation
 */
export function createEmailPrompt(data) {
    const { name, jobDescription, companyProfile, resume } = data;

    return `
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

1. First line can be greeting the recipient(if name is provided good otherwise hiring manager or recruiter).

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
}

/**
 * Get the system message for email generation
 * @returns {string} System message for the AI model
 */
export function getSystemMessage() {
    return "You are an expert job application assistant who writes personalized cold emails to recruiters. You must follow the exact email structure provided. Focus on specific skills matching between the resume and job description, with clear examples showing how the applicant's experience meets the job requirements. Create emails that highlight relevant qualifications, demonstrate knowledge of the company, and show genuine interest.";
} 