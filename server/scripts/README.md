# Scripts Directory

This directory contains utility scripts for managing the trivia quiz database.

## Main Scripts

### `manage_quizzes.ts`
**The primary CLI tool for managing subjects and questions.**

Features:
- Create/view/delete subjects
- Add questions (manually or via AI)
- AI model selection with token limits
- Source URL input for factual question generation
- Clipboard copy for IDE Agent prompts
- API usage tracking
- Multilingual support (English/Hebrew)

Usage:
```bash
npm run manage-quizzes
```

Command-line arguments:
```bash
# View all subjects
npm run manage-quizzes -- view-subjects

# Create subject with auto-generated questions
npm run manage-quizzes -- create-subject "Subject Name EN" "שם הנושא" 10

# Delete subject
npm run manage-quizzes -- delete-subject "Subject Name"
```

### `create_questions_of_subject.ts`
**Generic script to add questions to any subject from JSON files.**

This script is designed to work with the IDE Agent workflow:
1. Agent generates questions in JSON format
2. Script validates and inserts questions into database
3. Supports both new and existing subjects

Usage:
```bash
# Add questions to existing subject
npx ts-node scripts/create_questions_of_subject.ts <subject-id> questions.json

# Create new subject and add questions
npx ts-node scripts/create_questions_of_subject.ts new subject.json questions.json
```

**JSON File Formats:**

`subject.json`:
```json
{
  "name": { "en": "Subject Name", "he": "שם הנושא" },
  "description": { "en": "Description", "he": "תיאור" }
}
```

`questions.json`:
```json
[
  {
    "text": { "en": "Question?", "he": "שאלה?" },
    "options": [
      { "text": { "en": "Option 1", "he": "אפשרות 1" } },
      { "text": { "en": "Option 2", "he": "אפשרות 2" } },
      { "text": { "en": "Option 3", "he": "אפשרות 3" } },
      { "text": { "en": "Option 4", "he": "אפשרות 4" } }
    ],
    "correctAnswerIndex": 0
  }
]
```

## IDE Agent Workflow

When using the "Generate Prompt for IDE Agent" option in `manage_quizzes.ts`:

1. **Copy the prompt** to clipboard (new feature!)
2. **Paste into IDE Agent** chat
3. **Agent generates questions** and saves to temporary JSON file
4. **Run `create_questions_of_subject.ts`** with the JSON file to add questions to database

Example:
```bash
# After agent creates /tmp/questions.json
npx ts-node scripts/create_questions_of_subject.ts 507f1f77bcf86cd799439011 /tmp/questions.json
```

## Report Files

### `hashir_shelanu_sources_report.md`
Documentation of all 60 questions created for "השיר שלנו" subject, with Wikipedia source citations for each question.

## Environment Variables

All scripts require:
- `MONGODB_URI`: MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini API key (for AI features)
- `AI_DRY_RUN`: Set to `'true'` to prevent API calls

## Features

### AI Question Generation
- Dynamic model selection (10 stable Gemini models)
- Token limit display
- Source URL input for factual questions
- Duplicate prevention
- Usage tracking (RPM/RPD monitoring)

### Multilingual Support
- All questions require English and Hebrew text
- Automatic translation for descriptions
- Language selection for prompts

### Data Validation
- Schema validation for questions
- Duplicate detection
- Source citation tracking
