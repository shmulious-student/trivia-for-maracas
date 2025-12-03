#!/usr/bin/env -S npx ts-node
import inquirer from 'inquirer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import clipboardy from 'clipboardy';
import fs from 'fs';
import { SubjectSchema } from '../src/models/Subject';
import { QuestionSchema } from '../src/models/Question';
import { AIProviderFactory } from '../src/ai/AIProviderFactory';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI_DEV = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';
const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;

let devConn: mongoose.Connection;
let prodConn: mongoose.Connection | null = null;

async function connectDB() {
    try {
        devConn = await mongoose.createConnection(MONGODB_URI_DEV).asPromise();
        console.log('✅ Connected to MongoDB (Dev)');

        if (MONGODB_URI_PROD) {
            prodConn = await mongoose.createConnection(MONGODB_URI_PROD).asPromise();
            console.log('✅ Connected to MongoDB (Prod)');
        } else {
            console.log('⚠️  MONGODB_URI_PROD not found. Prod features disabled.');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

function getModels(env: 'dev' | 'prod') {
    const conn = env === 'dev' ? devConn : prodConn;
    if (!conn) throw new Error(`Connection for ${env} not established.`);
    return {
        Subject: conn.model('Subject', SubjectSchema),
        Question: conn.model('Question', QuestionSchema)
    };
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

    while (true) {
        const choices = [
            'Create Subject & Generate Questions',
            'Add Questions to Existing Subject',
            'View Subjects',
            'Delete Subject',
            'Delete Questions'
        ];

        if (prodConn) {
            choices.splice(3, 0, 'Copy Subject to Prod');
        }

        choices.push('Exit');

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices
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
                case 'Copy Subject to Prod':
                    await copySubjectToProd();
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

async function selectEnvironment(action: string): Promise<('dev' | 'prod')[]> {
    if (!prodConn) return ['dev'];

    const { envs } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'envs',
            message: `Select environment(s) to ${action}:`,
            choices: [
                { name: 'Development', value: 'dev', checked: true },
                { name: 'Production', value: 'prod' }
            ],
            validate: (answer) => answer.length > 0 ? true : 'You must select at least one environment.'
        }
    ]);
    return envs;
}

async function deleteSubject() {
    const envs = await selectEnvironment('delete from');

    for (const env of envs) {
        console.log(`\n--- Deleting from ${env.toUpperCase()} ---`);
        const { Subject, Question } = getModels(env);
        const subjects = await Subject.find();

        if (subjects.length === 0) {
            console.log(`No subjects found in ${env}.`);
            continue;
        }

        const { subjectId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'subjectId',
                message: `Select subject to delete from ${env}:`,
                choices: subjects.map((s: any) => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
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
            console.log(`✅ Subject and its questions deleted from ${env}.`);
        }
    }
}

async function deleteQuestions() {
    const envs = await selectEnvironment('delete questions from');

    // For simplicity, if multiple envs selected, we do one by one
    for (const env of envs) {
        console.log(`\n--- Deleting questions from ${env.toUpperCase()} ---`);
        const { Subject, Question } = getModels(env);

        const subjects = await Subject.find();
        if (subjects.length === 0) {
            console.log(`No subjects found in ${env}.`);
            continue;
        }

        const { subjectId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'subjectId',
                message: `Select subject in ${env}:`,
                choices: subjects.map((s: any) => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
            }
        ]);

        const questions = await Question.find({ subjectId });
        if (questions.length === 0) {
            console.log('No questions in this subject.');
            continue;
        }

        const { questionIds } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'questionIds',
                message: 'Select questions to delete:',
                choices: questions.map((q: any) => ({ name: q.text.en, value: q._id }))
            }
        ]);

        if (questionIds.length === 0) continue;

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Delete ${questionIds.length} questions from ${env}?`,
                default: false
            }
        ]);

        if (confirm) {
            const result = await Question.deleteMany({ _id: { $in: questionIds } });
            console.log(`✅ Deleted ${result.deletedCount} questions from ${env}.`);
        }
    }
}

async function createSubjectAndGenerate() {
    const envs = await selectEnvironment('create subject in');

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

    // Create subjects in selected envs
    const createdSubjects: { env: 'dev' | 'prod', subject: any }[] = [];

    for (const env of envs) {
        const { Subject } = getModels(env);
        const subject = await Subject.create(subjectData);
        console.log(`✅ Created subject "${nameEn}" in ${env.toUpperCase()}`);
        createdSubjects.push({ env, subject });
    }

    // Search Wikipedia for sources
    console.log('\nSearching Wikipedia for official sources...');
    const wikiResults = await Promise.all([
        searchWikipedia(nameEn, 'en'),
        searchWikipedia(nameHe, 'he')
    ]);

    const allWikiLinks = [...wikiResults[0], ...wikiResults[1]];
    let selectedSources: string[] = [];

    if (allWikiLinks.length > 0) {
        const { sources } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'sources',
                message: 'Select official sources from Wikipedia (Space to select):',
                choices: allWikiLinks.map(link => ({ name: `${link.title} (${link.url})`, value: link.url }))
            }
        ]);
        selectedSources = sources;
    } else {
        console.log('No Wikipedia pages found.');
    }

    // Generate questions
    // We generate once, then save to all selected envs
    // We'll use the first created subject as the "context" for generation
    if (createdSubjects.length > 0) {
        await generateQuestionsFlow(createdSubjects, selectedSources);
    }
}

async function searchWikipedia(query: string, lang: string): Promise<{ title: string, url: string }[]> {
    if (!query) return [];
    try {
        const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`;
        const response = await fetch(endpoint);
        const data = await response.json() as any;
        // data format: [query, [titles], [descriptions], [urls]]
        const titles = data[1] as string[];
        const urls = data[3] as string[];

        return titles.map((title, index) => ({
            title,
            url: urls[index]
        }));
    } catch (error) {
        console.error(`Failed to search Wikipedia (${lang}):`, error);
        return [];
    }
}

async function addQuestionsToSubject() {
    const envs = await selectEnvironment('add questions to');

    // If multiple envs, we need to pick a subject that exists in all? 
    // Or just pick one by one?
    // Let's do one by one for simplicity, or try to match by name?
    // Matching by name is better for "Both".

    // Strategy: Ask user to select a subject from Dev (primary) or Prod if Dev empty.
    // Then try to find matching subject in other selected envs.

    const primaryEnv = envs.includes('dev') ? 'dev' : 'prod';
    const { Subject } = getModels(primaryEnv);
    const subjects = await Subject.find();

    if (subjects.length === 0) {
        console.log(`No subjects found in ${primaryEnv}. Cannot proceed.`);
        return;
    }

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: `Select a subject (from ${primaryEnv}):`,
            choices: subjects.map((s: any) => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
        }
    ]);

    const primarySubject = await Subject.findById(subjectId);
    if (!primarySubject) return;

    const targetSubjects: { env: 'dev' | 'prod', subject: any }[] = [];
    targetSubjects.push({ env: primaryEnv, subject: primarySubject });

    // Find in other envs
    for (const env of envs) {
        if (env === primaryEnv) continue;
        const { Subject: OtherSubject } = getModels(env);
        // Try to find by name
        const match = await OtherSubject.findOne({
            'name.en': primarySubject.name.en
        });

        if (match) {
            targetSubjects.push({ env, subject: match });
            console.log(`Found matching subject in ${env}: ${match.name.en}`);
        } else {
            console.log(`⚠️  Could not find subject "${primarySubject.name.en}" in ${env}. Questions will NOT be added there.`);
        }
    }

    const { mode } = await inquirer.prompt([
        {
            type: 'list',
            name: 'mode',
            message: 'How do you want to add questions?',
            choices: [
                'Generate New (AI or Manual Prompt)',
                'Import JSON File directly'
            ]
        }
    ]);

    if (mode === 'Import JSON File directly') {
        const { filePath } = await inquirer.prompt([
            { type: 'input', name: 'filePath', message: 'Enter path to JSON file:' }
        ]);

        try {
            const content = fs.readFileSync(filePath.trim(), 'utf-8');
            const questions = JSON.parse(content);

            if (questions && questions.length > 0) {
                for (const target of targetSubjects) {
                    console.log(`\nSaving to ${target.env.toUpperCase()}...`);
                    await saveQuestions(target.env, target.subject, questions);
                }
            } else {
                console.log('No questions found in file.');
            }
        } catch (error) {
            console.error('Failed to read/parse file:', error);
        }
    } else {
        await generateQuestionsFlow(targetSubjects);
    }
}

async function generateQuestionsFlow(targets: { env: 'dev' | 'prod', subject: any }[], preselectedSources: string[] = []) {
    // Use the first subject for context
    const referenceSubject = targets[0].subject;

    // 1. Collect Inputs
    const inputs = await collectInputs(preselectedSources);

    // 2. Construct Prompt
    const prompt = constructPrompt(referenceSubject, inputs);

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

    let generatedQuestions: any[] = [];

    if (method === 'Manual (Copy Prompt to IDE)') {
        generatedQuestions = await handleManualGeneration(prompt);
    } else {
        generatedQuestions = await handleAutomaticGeneration(prompt);
    }

    if (generatedQuestions && generatedQuestions.length > 0) {
        for (const target of targets) {
            console.log(`\nSaving to ${target.env.toUpperCase()}...`);
            await saveQuestions(target.env, target.subject, generatedQuestions);
        }
    }
}

async function collectInputs(preselectedSources: string[] = []) {
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
            default: preselectedSources.join(', '),
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

async function handleManualGeneration(prompt: string): Promise<any[]> {
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

    if (!imported) return [];

    const { filePath } = await inquirer.prompt([
        { type: 'input', name: 'filePath', message: 'Enter path to JSON file:' }
    ]);

    try {
        const content = fs.readFileSync(filePath.trim(), 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Failed to read/parse file:', error);
        return [];
    }
}

async function handleAutomaticGeneration(prompt: string): Promise<any[]> {
    const provider = AIProviderFactory.getProvider();

    console.log('\nSending request to AI... this may take a while.');
    try {
        const questions = await (provider as any).generateFromPrompt(prompt);
        return questions;
    } catch (error) {
        console.error('AI Generation failed:', error);
        return [];
    }
}

async function saveQuestions(env: 'dev' | 'prod', subject: any, questions: any[]) {
    const { Question } = getModels(env);

    // Validate questions against schema
    const validQuestions = questions.map(q => ({
        ...q,
        subjectId: subject._id,
        // Ensure multilingual structure
        text: q.text.en ? q.text : { en: q.text, he: '' }, // Fallback if schema violated
        options: q.options.map((o: any) => o.text.en ? o : { text: { en: o.text, he: '' } })
    }));

    const result = await Question.insertMany(validQuestions);
    console.log(`✅ Successfully added ${result.length} questions to ${env.toUpperCase()}.`);

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
    if (devConn) {
        console.log('\n--- Development Subjects ---');
        const { Subject } = getModels('dev');
        const subjects = await Subject.find();
        subjects.forEach((s: any) => console.log(`${s._id}: ${s.name.en}`));
    }

    if (prodConn) {
        console.log('\n--- Production Subjects ---');
        const { Subject } = getModels('prod');
        const subjects = await Subject.find();
        subjects.forEach((s: any) => console.log(`${s._id}: ${s.name.en}`));
    }
}

async function copySubjectToProd() {
    if (!prodConn) {
        console.log('Production connection not available.');
        return;
    }

    const { Subject: DevSubject, Question: DevQuestion } = getModels('dev');
    const { Subject: ProdSubject, Question: ProdQuestion } = getModels('prod');

    const subjects = await DevSubject.find();
    if (subjects.length === 0) {
        console.log('No subjects in Dev.');
        return;
    }

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select subject to copy to Prod:',
            choices: subjects.map((s: any) => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
        }
    ]);

    const sourceSubject = await DevSubject.findById(subjectId);
    if (!sourceSubject) return;

    // Check if exists in Prod
    let targetSubject = await ProdSubject.findOne({ 'name.en': sourceSubject.name.en });

    if (targetSubject) {
        console.log(`Subject "${sourceSubject.name.en}" already exists in Prod.`);
        const { proceed } = await inquirer.prompt([
            { type: 'confirm', name: 'proceed', message: 'Do you want to add missing questions to it?', default: true }
        ]);
        if (!proceed) return;
    } else {
        // Create subject in Prod
        const subjectData: any = sourceSubject.toObject();
        delete subjectData._id;
        delete subjectData.createdAt;
        delete subjectData.updatedAt;
        delete subjectData.__v;

        targetSubject = await ProdSubject.create(subjectData);
        console.log(`✅ Created subject "${sourceSubject.name.en}" in Prod.`);
    }

    // Copy questions
    const sourceQuestions = await DevQuestion.find({ subjectId: sourceSubject._id });
    if (sourceQuestions.length === 0) {
        console.log('No questions to copy.');
        return;
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const q of sourceQuestions) {
        // Check for duplicate in Prod
        // We check by text.en
        const exists = await ProdQuestion.findOne({
            subjectId: targetSubject._id,
            'text.en': q.text.en
        });

        if (exists) {
            skippedCount++;
            continue;
        }

        const qData: any = q.toObject();
        delete qData._id;
        delete qData.createdAt;
        delete qData.updatedAt;
        delete qData.__v;
        qData.subjectId = targetSubject._id; // Mongoose handles ObjectId assignment

        await ProdQuestion.create(qData);
        addedCount++;
    }

    console.log(`✅ Copied ${addedCount} questions. Skipped ${skippedCount} duplicates.`);
}

main();
