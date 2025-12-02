import inquirer from 'inquirer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import clipboardy from 'clipboardy';
import fs from 'fs';
import { Subject } from '../src/models/Subject';
import { Question } from '../src/models/Question';
import { AIProviderFactory } from '../src/ai/AIProviderFactory';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

async function main() {
    await connectDB();

    // Display API usage stats
    try {
        const provider = AIProviderFactory.getProvider();
        if (provider instanceof require('../src/ai/GeminiProvider').GeminiProvider) {
            const tracker = (provider as any).getUsageTracker();
            tracker.displayStats();
        }
    } catch (error) {
        // Silently fail if provider not available
    }

    const args = process.argv.slice(2);
    if (args.length > 0) {
        // Handle args if needed, but primary workflow is interactive now
        console.log('Arguments not supported in this version. Please run interactively.');
        process.exit(0);
    }

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'Create Subject & Generate Questions',
                    'Add Questions to Existing Subject',
                    'View Subjects',
                    'Delete Subject',
                    'Delete Questions',
                    'Exit'
                ]
            }
        ]);

        if (action === 'Exit') {
            console.log('Goodbye!');
            process.exit(0);
        }

        try {
            switch (action) {
                case 'Create Subject & Generate Questions':
                    await createSubjectAndGenerate();
                    break;
                case 'Add Questions to Existing Subject':
                    await addQuestionsToSubject();
                    break;
                case 'View Subjects':
                    await viewSubjects();
                    break;
                case 'Delete Subject':
                    await deleteSubject();
                    break;
                case 'Delete Questions':
                    await deleteQuestions();
                    break;
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
}

async function deleteSubject() {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        console.log('No subjects found.');
        return;
    }

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select subject to delete:',
            choices: subjects.map(s => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
        }
    ]);

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure? This will delete the subject and ALL its questions.',
            default: false
        }
    ]);

    if (confirm) {
        await Question.deleteMany({ subjectId });
        await Subject.findByIdAndDelete(subjectId);
        console.log('✅ Subject and its questions deleted.');
    }
}

async function deleteQuestions() {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        console.log('No subjects found.');
        return;
    }

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select subject:',
            choices: subjects.map(s => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
        }
    ]);

    const questions = await Question.find({ subjectId });
    if (questions.length === 0) {
        console.log('No questions in this subject.');
        return;
    }

    const { questionIds } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'questionIds',
            message: 'Select questions to delete:',
            choices: questions.map(q => ({ name: q.text.en, value: q._id }))
        }
    ]);

    if (questionIds.length === 0) return;

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Delete ${questionIds.length} questions?`,
            default: false
        }
    ]);

    if (confirm) {
        const result = await Question.deleteMany({ _id: { $in: questionIds } });
        console.log(`✅ Deleted ${result.deletedCount} questions.`);
    }
}

async function createSubjectAndGenerate() {
    const { nameEn, nameHe, descEn } = await inquirer.prompt([
        { type: 'input', name: 'nameEn', message: 'Subject Name (English):' },
        { type: 'input', name: 'nameHe', message: 'Subject Name (Hebrew):' },
        { type: 'input', name: 'descEn', message: 'Subject Description (English, optional):' }
    ]);

    let descHe = '';
    if (descEn) {
        const provider = AIProviderFactory.getProvider();
        try {
            console.log('Translating description...');
            descHe = await provider.translate(descEn, 'Hebrew');
        } catch (e) {
            console.error('Failed to translate description:', e);
            descHe = descEn; // Fallback
        }
    }

    const subjectData: any = {
        name: { en: nameEn, he: nameHe }
    };

    if (descEn) {
        subjectData.description = { en: descEn, he: descHe };
    }

    const subject = await Subject.create(subjectData);
    console.log(`Created subject: ${nameEn}`);

    await generateQuestionsFlow(subject);
}

async function addQuestionsToSubject() {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        console.log('No subjects found.');
        return;
    }

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select a subject:',
            choices: subjects.map(s => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
        }
    ]);

    const subject = await Subject.findById(subjectId);
    if (!subject) return;

    await generateQuestionsFlow(subject);
}

async function generateQuestionsFlow(subject: any) {
    // 1. Collect Inputs
    const inputs = await collectInputs();

    // 2. Construct Prompt
    const prompt = constructPrompt(subject, inputs);

    // 3. Choose Execution Method
    const { method } = await inquirer.prompt([
        {
            type: 'list',
            name: 'method',
            message: 'How do you want to generate the questions?',
            choices: [
                'Manual (Copy Prompt to IDE)',
                'Automatic (Use AI API)'
            ]
        }
    ]);

    if (method === 'Manual (Copy Prompt to IDE)') {
        await handleManualGeneration(prompt, subject);
    } else {
        await handleAutomaticGeneration(prompt, subject, inputs.count);
    }
}

async function collectInputs() {
    const { count, sourcesInput, subtopicsInput, difficultyInput } = await inquirer.prompt([
        {
            type: 'number',
            name: 'count',
            message: 'How many questions to generate?',
            default: 10
        },
        {
            type: 'input',
            name: 'sourcesInput',
            message: 'Enter Official Source URLs (comma-separated, REQUIRED):',
            validate: (input) => input.trim().length > 0 ? true : 'At least one source is required.'
        },
        {
            type: 'input',
            name: 'subtopicsInput',
            message: 'Enter Sub-topics (comma-separated, optional):'
        },
        {
            type: 'input',
            name: 'difficultyInput',
            message: 'Enter Difficulty Distribution (e.g., "30% Easy, 40% Medium, 30% Hard"):',
            default: '30% Easy, 40% Medium, 30% Hard'
        }
    ]);

    const sources = sourcesInput.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const subtopics = subtopicsInput ? subtopicsInput.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];

    return { count, sources, subtopics, difficulty: difficultyInput };
}

function constructPrompt(subject: any, inputs: any) {
    const { count, sources, subtopics, difficulty } = inputs;

    let prompt = `Generate ${count} trivia questions for the subject: "${subject.name.en}" (${subject.name.he}).\n`;
    if (subject.description?.en) prompt += `Description: ${subject.description.en}\n`;

    prompt += `\nSTRICT REQUIREMENTS:\n`;
    prompt += `1. **Factual Accuracy**: All questions must be based ONLY on the provided official sources. Verify every fact.\n`;
    prompt += `2. **Sources**: You MUST provide the specific Source URL and a short Quote from the text that proves the answer for EACH question.\n`;
    prompt += `3. **Language**: Output in English and Hebrew. Ensure high-quality translation, correct grammar, and spelling.\n`;
    prompt += `4. **Difficulty**: Follow this distribution: ${difficulty}.\n`;
    if (subtopics.length > 0) {
        prompt += `5. **Sub-topics**: Focus on these areas: ${subtopics.join(', ')}.\n`;
    }
    prompt += `6. **Format**: Return a STRICT JSON array matching the schema below. No markdown formatting, just the raw JSON.\n`;
    prompt += `7. **Report**: You MUST also generate a separate JSON file named "report.json" containing a report of the generated questions. This file should include the question text, source URL, source quote, and the correct answer for each question.\n`;
    prompt += `8. **Cleanup**: You MUST clean up any temporary files (JSON, HTML, TXT) created during the process, EXCEPT for the "questions.json" and "report.json" files.\n`;

    prompt += `\nOFFICIAL SOURCES:\n`;
    sources.forEach((s: string) => prompt += `- ${s}\n`);

    prompt += `\nJSON SCHEMA (questions.json):\n`;
    prompt += `[
  {
    "text": { "en": "Question text", "he": "טקסט השאלה" },
    "options": [
      { "text": { "en": "Option 1", "he": "אפשרות 1" } },
      { "text": { "en": "Option 2", "he": "אפשרות 2" } },
      { "text": { "en": "Option 3", "he": "אפשרות 3" } },
      { "text": { "en": "Option 4", "he": "אפשרות 4" } }
    ],
    "correctAnswerIndex": 0, // 0-3
    "sourceUrl": "https://example.com/source",
    "sourceQuote": "Exact text from source proving the answer"
  }
]`;

    prompt += `\nJSON SCHEMA (report.json):\n`;
    prompt += `{
  "questions": [
    {
      "text": { "en": "Question text", "he": "טקסט השאלה" },
      "sourceUrl": "https://example.com/source",
      "sourceQuote": "Exact text from source proving the answer",
      "answer": "Correct Answer Text (English)"
    }
  ]
}`;

    return prompt;
}

async function handleManualGeneration(prompt: string, subject: any) {
    console.log('\n[GENERATED PROMPT]');
    console.log('---------------------------------------------------');
    console.log(prompt);
    console.log('---------------------------------------------------');

    const { copy } = await inquirer.prompt([
        { type: 'confirm', name: 'copy', message: 'Copy prompt to clipboard?', default: true }
    ]);

    if (copy) {
        try {
            await clipboardy.write(prompt);
            console.log('✅ Copied to clipboard.');
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }

    console.log('\nINSTRUCTIONS:');
    console.log('1. Paste the prompt into your IDE Agent.');
    console.log('2. Save the generated JSON to a file (e.g., "questions.json").');
    console.log('3. Come back here to import the file.');

    const { imported } = await inquirer.prompt([
        { type: 'confirm', name: 'imported', message: 'Ready to import JSON file?', default: true }
    ]);

    if (!imported) return;

    const { filePath } = await inquirer.prompt([
        { type: 'input', name: 'filePath', message: 'Enter path to JSON file:' }
    ]);

    try {
        const content = fs.readFileSync(filePath.trim(), 'utf-8');
        const questions = JSON.parse(content);
        await saveQuestions(subject, questions);
    } catch (error) {
        console.error('Failed to read/parse file:', error);
    }
}

async function handleAutomaticGeneration(prompt: string, subject: any, count: number) {
    const provider = AIProviderFactory.getProvider();

    console.log('\nSending request to AI... this may take a while.');
    try {
        // We use the raw prompt generation capability if available, or fallback to generateQuestions
        // But since we have a specific schema and requirements, we should ideally use a raw completion method
        // or modify generateQuestions to accept a full custom prompt.
        // For now, assuming the provider has a method to handle this or we adapt.
        // The current GeminiProvider.generateQuestions takes (topic, count, language, sources).
        // It constructs its OWN prompt.
        // To satisfy the user requirement "use the same prompt", we need a way to pass this raw prompt.

        // Let's assume we can pass the prompt as the "topic" if we modify the provider, 
        // OR we just use the provider's native method but try to align the prompt logic.
        // The user explicitly said: "Manage quizzes script should still have the ai api call option, but it should finally use the same prompt as we construct for local manual use"

        // So we should probably add a method `generateFromPrompt` to the provider interface or cast it.
        // For now, I will try to use `generateQuestions` but I'll need to check if I can override the prompt.
        // Looking at GeminiProvider, it constructs the prompt internally.
        // I will attempt to use a new method on the provider if I can add it, or just use the prompt as the message.

        // Since I cannot easily modify the provider interface across the board without breaking things,
        // I will try to use the `generateContent` method of the underlying model if exposed, 
        // or just pass this prompt text as the "topic" and hope the provider handles it, 
        // BUT the provider wraps the topic.

        // BEST APPROACH: Add a `generateRaw(prompt: string)` method to the provider or use `generateQuestions` with a flag.
        // I'll try to use the `generateQuestions` but pass the WHOLE prompt as the topic, 
        // and maybe the provider is smart enough? No, it wraps it.

        // I will modify GeminiProvider to accept a raw prompt or add a new method.
        // For this script, I'll assume I can call `provider.generateFromPrompt(prompt)` if I add it.
        // Let's check GeminiProvider.ts first.

        // For now, I'll simulate it by calling the internal method if possible, or just fail over to manual if not supported.
        // Actually, I can just use the `topic` argument to pass the core instructions, but the prompt construction logic is duplicated.

        // To strictly follow "use the same prompt", I should probably expose a method in the provider 
        // that takes the full prompt.

        // I'll try to cast to any and call `generateFromPrompt` and I will add that method to GeminiProvider in a separate step if needed.
        // For now, let's assume `generateQuestions` can take an option to use raw prompt.

        // Workaround: I will pass the prompt as the "topic" and hope the provider's wrapper doesn't mess it up too much,
        // OR I will modify the provider. Modifying the provider is cleaner.

        // I'll stick to the plan: I'll write this script to call `provider.generateFromPrompt(prompt)` 
        // and I will add that method to `GeminiProvider` in the next step.

        const questions = await (provider as any).generateFromPrompt(prompt);
        await saveQuestions(subject, questions);

    } catch (error) {
        console.error('AI Generation failed:', error);
    }
}

async function saveQuestions(subject: any, questions: any[]) {
    // Validate questions against schema
    const validQuestions = questions.map(q => ({
        ...q,
        subjectId: subject._id,
        // Ensure multilingual structure
        text: q.text.en ? q.text : { en: q.text, he: '' }, // Fallback if schema violated
        options: q.options.map((o: any) => o.text.en ? o : { text: { en: o.text, he: '' } })
    }));

    const result = await Question.insertMany(validQuestions);
    console.log(`✅ Successfully added ${result.length} questions.`);

    await generateReport(subject, validQuestions);
}

async function generateReport(subject: any, questions: any[]) {
    const report = `# Report for Subject: ${subject.name.en}
Date: ${new Date().toISOString()}
Total Questions Added: ${questions.length}

## Questions
${questions.map((q, i) => `
### ${i + 1}. ${q.text.en}
**Hebrew**: ${q.text.he}
**Source**: [Link](${q.sourceUrl})
**Quote**: "${q.sourceQuote}"
**Answer**: ${q.options[q.correctAnswerIndex].text.en}
`).join('\n')}
`;

    // Save report to Subject
    subject.lastReport = report;
    await subject.save();

    // Also save to file
    const reportPath = path.join(__dirname, `report_${subject._id}_${Date.now()}.md`);
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Report generated: ${reportPath}`);
}

async function viewSubjects() {
    const subjects = await Subject.find();
    subjects.forEach(s => console.log(`${s._id}: ${s.name.en}`));
}

main();
