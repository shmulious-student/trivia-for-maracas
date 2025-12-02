import inquirer from 'inquirer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import clipboardy from 'clipboardy';
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
        await handleArgs(args);
        process.exit(0);
    }

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View Subjects/Questions',
                    'Add Questions',
                    'Create Subject',
                    'Delete Subject/Questions',
                    'Edit Questions',
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
                case 'View Subjects/Questions':
                    await viewSubjects();
                    break;
                case 'Add Questions':
                    await addQuestions();
                    break;
                case 'Create Subject':
                    await createSubject();
                    break;
                case 'Delete Subject/Questions':
                    await deleteSubject();
                    break;
                case 'Edit Questions':
                    await editQuestions();
                    break;
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
}

async function handleArgs(args: string[]) {
    const action = args[0];
    switch (action) {
        case 'create-subject':
            const nameEn = args[args.indexOf('--en') + 1];
            const nameHe = args[args.indexOf('--he') + 1];
            const descEn = args.includes('--desc') ? args[args.indexOf('--desc') + 1] : undefined;
            const count = parseInt(args[args.indexOf('--count') + 1] || '0');
            if (!nameEn || !nameHe) {
                console.error('Usage: create-subject --en "Name" --he "Name" [--desc "Description"] [--count N]');
                return;
            }
            await createSubjectArgs(nameEn, nameHe, count, descEn);
            break;
        case 'view-subjects':
            await viewSubjectsArgs();
            break;
        case 'delete-empty-subjects':
            await deleteEmptySubjectsArgs();
            break;
        case 'delete-subject':
            const subjectName = args[args.indexOf('--name') + 1];
            if (!subjectName) {
                console.error('Usage: delete-subject --name "Subject Name (English)"');
                return;
            }
            await deleteSubjectArgs(subjectName);
            break;
        default:
            console.log('Unknown action. Available: create-subject, view-subjects, delete-empty-subjects, delete-subject');
    }
}

async function createSubjectArgs(nameEn: string, nameHe: string, count: number, descEn?: string) {
    const subjectData: any = { name: { en: nameEn, he: nameHe } };

    if (descEn) {
        const provider = AIProviderFactory.getProvider();
        let descHe = '';
        try {
            console.log('Translating description...');
            descHe = await provider.translate(descEn, 'Hebrew');
            subjectData.description = { en: descEn, he: descHe };
        } catch (e) {
            console.error('Failed to translate description:', e);
        }
    }

    const subject = await Subject.create(subjectData);
    console.log(`Created subject: ${nameEn}`);

    if (count > 0) {
        const topic = descEn ? `${nameEn} - ${descEn}` : nameEn;

        // Ask user for generation method
        const { method } = await inquirer.prompt([
            {
                type: 'list',
                name: 'method',
                message: `Generate ${count} questions for "${nameEn}" - Select method:`,
                choices: [
                    'Direct API Call (Automatic)',
                    'Generate Prompt for IDE Agent (Manual)'
                ]
            }
        ]);

        if (method === 'Generate Prompt for IDE Agent (Manual)') {
            // Show IDE prompt
            console.log('\n[MANUAL PROMPT GENERATION]');
            console.log('Please ask the Antigravity IDE Agent to generate questions with the following prompt:');
            console.log('---------------------------------------------------');

            const promptText = `Please add ${count} questions to Subject ID ${subject._id} (${nameEn}).
Description: ${topic}.
Output Languages: English, Hebrew.
Ensure all text (questions, options, answers) is provided in all selected languages.
IMPORTANT: Read all existing questions under the edited subject and make sure you don't create questions that already exist or similar to existing questions in this subject.`;

            console.log(promptText);
            console.log('---------------------------------------------------');

            // Ask if user wants to copy to clipboard
            const { copyToClipboard } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'copyToClipboard',
                    message: 'Copy prompt to clipboard?',
                    default: true
                }
            ]);

            if (copyToClipboard) {
                try {
                    await clipboardy.write(promptText);
                    console.log('✅ Prompt copied to clipboard!');
                } catch (error) {
                    console.error('❌ Failed to copy to clipboard:', error);
                }
            }

            const { confirmed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmed',
                    message: 'Have you completed the task in the IDE and saved changes to DB?',
                    default: false
                }
            ]);

            if (confirmed) {
                console.log('Verifying changes...');
                const currentCount = await Question.countDocuments({ subjectId: subject._id });
                console.log(`Current question count for subject: ${currentCount}`);
            }
        } else {
            // Direct API call
            const provider = AIProviderFactory.getProvider();

            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `About to send 1 API request to generate ${count} questions about "${topic}". Proceed?`,
                    default: true
                }
            ]);

            if (!confirm) {
                console.log('Operation cancelled.');
                return;
            }

            try {
                console.log('Generating questions... please wait.');
                const questions = await provider.generateQuestions(topic, count, 'English');

                const newQuestions = questions.map((q: any) => ({
                    ...q,
                    subjectId: subject._id,
                    text: q.text.en ? q.text : { en: q.text, he: '' },
                    options: q.options.map((o: any) => o.text.en ? o : { text: { en: o.text, he: '' } })
                }));

                await Question.insertMany(newQuestions);
                console.log(`✅ Successfully added ${newQuestions.length} questions.`);
            } catch (error) {
                console.error('❌ AI Generation failed:', error);
                console.log('\n💡 Tip: Use the "Generate Prompt for IDE Agent" method instead for more reliable results.');
            }
        }
    }
}

async function viewSubjectsArgs() {
    const subjects = await Subject.find();
    subjects.forEach(s => console.log(`${s._id}: ${s.name.en} / ${s.name.he}`));
}

async function addQuestionsAIArgs(subjectId: any, topic: string, count: number) {
    try {
        const provider = AIProviderFactory.getProvider();
        // Default model

        if (process.env.AI_DRY_RUN === 'true') {
            const subject = await Subject.findById(subjectId);
            const subjectName = subject ? subject.name.en : 'Unknown Subject';

            console.log('\n[DRY RUN MODE ACTIVATED]');
            console.log('Please ask the Antigravity IDE Agent to generate questions with the following prompt:');
            console.log('---------------------------------------------------');
            console.log(`Please add ${count} questions to Subject ID ${subjectId} (${subjectName}).`);
            console.log(`Description: ${topic}.`);
            console.log(`Output Languages: English, Hebrew.`);
            console.log(`Ensure all text (questions, options, answers) is provided in all selected languages.`);
            console.log(`IMPORTANT: Read all existing questions under the edited subject and make sure you don't create questions that already exist or similar to existing questions in this subject.`);
            console.log('---------------------------------------------------');

            // In args mode, we might not want to block, but for safety/verification we should probably wait or just exit.
            // Given the requirement is to "wait for user to approve", we'll use inquirer even in args mode if possible,
            // or just print and exit if strictly non-interactive. 
            // Assuming args mode can still be interactive for confirmation:
            const { confirmed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmed',
                    message: 'Have you completed the task in the IDE and saved changes to DB?',
                    default: false
                }
            ]);

            if (confirmed) {
                console.log('Verifying changes...');
                const currentCount = await Question.countDocuments({ subjectId });
                console.log(`Current question count for subject: ${currentCount}`);
            }
            return;
        }

        console.log('Generating questions... please wait.');
        const questions = await provider.generateQuestions(topic, count, 'English');

        const newQuestions = questions.map((q: any) => ({
            ...q,
            subjectId,
            text: q.text.en ? q.text : { en: q.text, he: '' },
            options: q.options.map((o: any) => o.text.en ? o : { text: { en: o.text, he: '' } })
        }));

        await Question.insertMany(newQuestions);
        console.log(`Successfully added ${newQuestions.length} questions.`);

    } catch (error) {
        console.error('AI Generation failed:', error);
    }
}

async function deleteEmptySubjectsArgs() {
    const subjects = await Subject.find();
    let deletedCount = 0;
    for (const subject of subjects) {
        const count = await Question.countDocuments({ subjectId: subject._id });
        if (count === 0) {
            await Subject.findByIdAndDelete(subject._id);
            console.log(`Deleted empty subject: ${subject.name.en}`);
            deletedCount++;
        }
    }
    console.log(`Total empty subjects deleted: ${deletedCount}`);
}

async function deleteSubjectArgs(nameEn: string) {
    const subject = await Subject.findOne({ 'name.en': nameEn });
    if (!subject) {
        console.log(`Subject "${nameEn}" not found.`);
        return;
    }

    await Question.deleteMany({ subjectId: subject._id });
    await Subject.findByIdAndDelete(subject._id);
    console.log(`Subject "${nameEn}" and its questions deleted.`);
}

async function viewSubjects() {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        console.log('No subjects found.');
        return;
    }

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select a subject to view details:',
            choices: subjects.map(s => ({ name: `${s.name.en} / ${s.name.he}`, value: s._id }))
        }
    ]);

    const questions = await Question.find({ subjectId });
    console.log(`\nFound ${questions.length} questions for subject.`);

    questions.forEach((q, idx) => {
        console.log(`\n${idx + 1}. [EN] ${q.text.en}`);
        console.log(`   [HE] ${q.text.he}`);
        console.log(`   Options: ${q.options.map(o => `${o.text.en} (${o.text.he})`).join(', ')}`);
        console.log(`   Correct Answer Index: ${q.correctAnswerIndex}`);
    });
    console.log('\n');
}

async function addQuestions() {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        console.log('No subjects found. Create a subject first.');
        return;
    }

    const { subjectId, method } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select a subject:',
            choices: subjects.map(s => ({ name: `${s.name.en}`, value: s._id }))
        },
        {
            type: 'list',
            name: 'method',
            message: 'How do you want to add questions?',
            choices: ['AI Generated', 'Manual Entry']
        }
    ]);

    if (method === 'AI Generated') {
        await addQuestionsAI(subjectId);
    } else {
        await addQuestionsManual(subjectId);
    }
}

async function addQuestionsAI(subjectId: any) {
    try {
        const provider = AIProviderFactory.getProvider();
        const models = await provider.listModels();

        const { model, topic, count, sourcesInput } = await inquirer.prompt([
            {
                type: 'list',
                name: 'model',
                message: 'Select AI Model:',
                choices: models
            },
            {
                type: 'input',
                name: 'topic',
                message: 'Enter topic/description for questions:'
            },
            {
                type: 'number',
                name: 'count',
                message: 'How many questions?',
                default: 5
            },
            {
                type: 'input',
                name: 'sourcesInput',
                message: 'Enter source URLs (comma-separated, or leave empty for none):',
                default: ''
            }
        ]);

        // Parse sources from comma-separated string
        const sources: string[] = sourcesInput
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

        if (provider instanceof require('../src/ai/GeminiProvider').GeminiProvider) {
            (provider as any).setModel(model);
        }

        const { method, languages } = await inquirer.prompt([
            {
                type: 'list',
                name: 'method',
                message: 'Select Generation Method:',
                choices: [
                    'Direct API Call (Automatic)',
                    'Generate Prompt for IDE Agent (Manual)'
                ]
            },
            {
                type: 'checkbox',
                name: 'languages',
                message: 'Select Target Languages:',
                choices: ['English', 'Hebrew'],
                default: ['English', 'Hebrew'],
                validate: (answer) => answer.length > 0 ? true : 'You must select at least one language.'
            }
        ]);

        if (method === 'Generate Prompt for IDE Agent (Manual)') {
            const subject = await Subject.findById(subjectId);
            const subjectName = subject ? subject.name.en : 'Unknown Subject';

            // Build the prompt text
            let promptText = `Please add ${count} questions to Subject ID ${subjectId} (${subjectName}).\n`;
            promptText += `Description: ${topic}.\n`;
            if (sources.length > 0) {
                promptText += `\nFACTUAL SOURCES (base questions ONLY on these sources):\n`;
                sources.forEach((source, i) => promptText += `  ${i + 1}. ${source}\n`);
                promptText += `\nIMPORTANT: All questions must be based STRICTLY on factual information from the provided sources above. No abstract or interpretable questions.\n`;
            }
            promptText += `Output Languages: ${languages.join(', ')}.\n`;
            promptText += `Ensure all text (questions, options, answers) is provided in all selected languages.\n`;
            promptText += `IMPORTANT: Read all existing questions under the edited subject and make sure you don't create questions that already exist or similar to existing questions in this subject.`;

            console.log('\n[MANUAL PROMPT GENERATION]');
            console.log('Please ask the Antigravity IDE Agent to generate questions with the following prompt:');
            console.log('---------------------------------------------------');
            console.log(promptText);
            console.log('---------------------------------------------------');

            // Ask if user wants to copy to clipboard
            const { copyToClipboard } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'copyToClipboard',
                    message: 'Copy prompt to clipboard?',
                    default: true
                }
            ]);

            if (copyToClipboard) {
                try {
                    await clipboardy.write(promptText);
                    console.log('✅ Prompt copied to clipboard!');
                } catch (error) {
                    console.error('❌ Failed to copy to clipboard:', error);
                }
            }

            const { confirmed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmed',
                    message: 'Have you completed the task in the IDE and saved changes to DB?',
                    default: false
                }
            ]);

            if (confirmed) {
                console.log('Verifying changes...');
                const currentCount = await Question.countDocuments({ subjectId });
                console.log(`Current question count for subject: ${currentCount}`);
            }
            return;
        }

        // Direct API Call
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `About to send 1 API request to generate ${count} questions about "${topic}"${sources.length > 0 ? ' using ' + sources.length + ' source(s)' : ''} in [${languages.join(', ')}]. Proceed?`,
                default: true
            }
        ]);

        if (!confirm) {
            console.log('Operation cancelled.');
            return;
        }

        console.log('Generating questions... please wait.');
        // Pass sources to the provider
        const questions = await provider.generateQuestions(topic, count, 'English', sources);

        // Save to DB
        // Map directly, assuming structure matches what we asked for
        const newQuestions = questions.map((q: any) => ({
            ...q,
            subjectId,
            // Ensure structure if AI missed it, but prompt asked for it
            text: q.text.en ? q.text : { en: q.text, he: '' },
            options: q.options.map((o: any) => o.text.en ? o : { text: { en: o.text, he: '' } })
        }));

        await Question.insertMany(newQuestions);
        console.log(`Successfully added ${newQuestions.length} questions.`);

    } catch (error) {
        console.error('AI Generation failed:', error);
        await fallbackToIDE(subjectId);
    }
}

async function addQuestionsManual(subjectId: any) {
    const { count } = await inquirer.prompt([
        { type: 'number', name: 'count', message: 'How many questions to add?', default: 1 }
    ]);

    for (let i = 0; i < count; i++) {
        console.log(`\nQuestion ${i + 1}:`);
        const qData = await inquirer.prompt([
            { type: 'input', name: 'textEn', message: 'Question Text (English):' },
            { type: 'input', name: 'opt1En', message: 'Option 1 (English):' },
            { type: 'input', name: 'opt2En', message: 'Option 2 (English):' },
            { type: 'input', name: 'opt3En', message: 'Option 3 (English):' },
            { type: 'input', name: 'opt4En', message: 'Option 4 (English):' },
            { type: 'number', name: 'correctIndex', message: 'Correct Answer Index (0-3):' }
        ]);

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Translate content to Hebrew (1 API request)?',
                default: true
            }
        ]);

        let textHe = '';
        let optsHe = ['', '', '', ''];

        if (confirm) {
            const provider = AIProviderFactory.getProvider();
            console.log('Translating...');
            const textsToTranslate = [
                qData.textEn,
                qData.opt1En,
                qData.opt2En,
                qData.opt3En,
                qData.opt4En
            ];

            try {
                const translations = await provider.translateBatch(textsToTranslate, 'Hebrew');
                if (translations.length === 5) {
                    textHe = translations[0];
                    optsHe = translations.slice(1);
                }
            } catch (e) {
                console.error('Translation failed, saving without Hebrew:', e);
            }
        }

        await Question.create({
            subjectId,
            text: { en: qData.textEn, he: textHe },
            options: [
                { text: { en: qData.opt1En, he: optsHe[0] } },
                { text: { en: qData.opt2En, he: optsHe[1] } },
                { text: { en: qData.opt3En, he: optsHe[2] } },
                { text: { en: qData.opt4En, he: optsHe[3] } }
            ],
            correctAnswerIndex: qData.correctIndex
        });
        console.log('Question added.');
    }
}

async function fallbackToIDE(subjectId: any) {
    console.log('\nAI Provider failed or not available.');
    console.log('Please ask the Antigravity IDE Agent to generate questions with the following prompt:');
    console.log('---------------------------------------------------');
    console.log(`Generate JSON for trivia questions about the selected subject.
    Format: Array of objects with text, options (array of {text}), correctAnswerIndex.
    Subject ID: ${subjectId}`);
    console.log('---------------------------------------------------');

    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Have you completed the task in the IDE and saved changes to DB?',
            default: false
        }
    ]);

    if (confirmed) {
        console.log('Verifying changes...');
        const count = await Question.countDocuments({ subjectId });
        console.log(`Current question count for subject: ${count}`);
        // In a real scenario, we might track previous count to show delta
    }
}

async function createSubject() {
    const { nameEn, nameHe, descEn, count } = await inquirer.prompt([
        { type: 'input', name: 'nameEn', message: 'Subject Name (English):' },
        { type: 'input', name: 'nameHe', message: 'Subject Name (Hebrew):' },
        { type: 'input', name: 'descEn', message: 'Subject Description (English, optional):' },
        { type: 'number', name: 'count', message: 'Initial number of questions (AI generated):', default: 5 }
    ]);

    let descHe = '';
    if (descEn) {
        const provider = AIProviderFactory.getProvider();
        try {
            console.log('Translating description...');
            descHe = await provider.translate(descEn, 'Hebrew');
        } catch (e) {
            console.error('Failed to translate description:', e);
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

    if (count > 0) {
        console.log(`\nNow let's add ${count} questions to this subject...`);
        // Use the interactive addQuestionsAI which offers the choice
        await addQuestionsAI(subject._id);
    }
}

async function deleteSubject() {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        console.log('No subjects found.');
        return;
    }

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to delete?',
            choices: [
                'Delete a specific subject (and its questions)',
                'Delete all empty subjects (0 questions)',
                'Delete specific questions from a subject'
            ]
        }
    ]);

    if (action === 'Delete all empty subjects (0 questions)') {
        let deletedCount = 0;
        for (const subject of subjects) {
            const count = await Question.countDocuments({ subjectId: subject._id });
            if (count === 0) {
                await Subject.findByIdAndDelete(subject._id);
                console.log(`Deleted empty subject: ${subject.name.en}`);
                deletedCount++;
            }
        }
        console.log(`Total empty subjects deleted: ${deletedCount}`);
    } else if (action === 'Delete a specific subject (and its questions)') {
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
            console.log('Subject and its questions deleted.');
        }
    } else {
        // Delete specific questions
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

        const result = await Question.deleteMany({ _id: { $in: questionIds } });
        console.log(`Deleted ${result.deletedCount} questions.`);
    }
}

async function editQuestions() {
    const subjects = await Subject.find();
    if (subjects.length === 0) return;

    const { subjectId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'subjectId',
            message: 'Select subject:',
            choices: subjects.map(s => ({ name: s.name.en, value: s._id }))
        }
    ]);

    const questions = await Question.find({ subjectId });
    const { questionId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'questionId',
            message: 'Select question to edit:',
            choices: questions.map(q => ({ name: q.text.en, value: q._id }))
        }
    ]);

    const question = questions.find(q => q._id.toString() === questionId.toString());
    if (!question) return;

    const { textEn, correctIndex } = await inquirer.prompt([
        { type: 'input', name: 'textEn', message: 'Edit Question Text (English):', default: question.text.en },
        { type: 'number', name: 'correctIndex', message: 'Correct Answer Index:', default: question.correctAnswerIndex }
    ]);

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Update Hebrew translation (1 API request)?',
            default: true
        }
    ]);

    let textHe = question.text.he;
    if (confirm) {
        const provider = AIProviderFactory.getProvider();
        console.log('Updating translation...');
        try {
            textHe = await provider.translate(textEn, 'Hebrew');
        } catch (e) {
            console.error('Translation failed:', e);
        }
    }

    await Question.findByIdAndUpdate(questionId, {
        'text.en': textEn,
        'text.he': textHe,
        correctAnswerIndex: correctIndex
    });
    console.log('Question updated.');
}

main();
