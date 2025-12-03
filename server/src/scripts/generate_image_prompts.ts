import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Subject } from '../models/Subject';
import { Question } from '../models/Question';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

const generatePrompts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const subjects = await Subject.find({});

        let markdownContent = '# AI Image Generation Prompts\n\nUse these prompts with an AI image generator (like Midjourney, DALL-E 3, or Stable Diffusion) to create cover images for your subject cards.\n\n';

        for (const subject of subjects) {
            const name = subject.name.en;
            const description = subject.description?.en || '';

            // Fetch questions for this subject
            const questions = await Question.find({ subjectId: subject._id }).limit(15);

            // Helper to clean text for visual prompts
            const cleanForPrompt = (text: string) => {
                return text
                    .replace(/trivia|question|questions|collection|ask about|answer|quiz/gi, '') // Remove meta words
                    .replace(/\b(what|who|where|when|which|how|why)\b/gi, '') // Remove question words
                    .replace(/[?]/g, '') // Remove question marks
                    .replace(/\s+/g, ' ') // Collapse whitespace
                    .trim();
            };

            const cleanDescription = cleanForPrompt(description);
            const cleanQuestions = questions.map(q => cleanForPrompt(q.text.en)).join(', ');

            // Construct visual context
            const visualContext = `
            Main Subject: ${name}
            Key Elements & Themes: ${cleanDescription}
            Associated Imagery: ${cleanQuestions}
            `.trim();

            // Construct the prompt
            const prompt = `
## ${name}

**Copy and paste this prompt:**

\`\`\`text
Subject: ${name}
----------------------------------------
Create a premium, modern digital art illustration of "${name}".
Visual Elements: ${visualContext.substring(0, 800)}... (truncated for brevity)
Style: High-quality 3D iconographic elements, vibrant colors, smooth gradient background, soft cinematic lighting, minimal and clean design, glassmorphism aesthetic.
Composition: Centered main element with abstract background shapes.
Aspect Ratio: 2:1 (Wide Landscape, approx 850x400px).
Negative Prompt: Text, words, letters, blurry, low quality, distorted, photo-realistic, cluttered, messy.
----------------------------------------
\`\`\`
`;
            console.log(prompt);
            markdownContent += prompt + '\n---\n';
        }

        const outputPath = path.join(__dirname, '../../../image_prompts.md');
        fs.writeFileSync(outputPath, markdownContent);
        console.log(`\nSuccessfully exported prompts to: ${outputPath}`);

        process.exit(0);
    } catch (error) {
        console.error('Error generating prompts:', error);
        process.exit(1);
    }
};

generatePrompts();
