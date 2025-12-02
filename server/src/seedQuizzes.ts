import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Subject } from './models/Subject';
import { Question } from './models/Question';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trivia';

const subjectsData = [
    {
        name: { en: 'General Knowledge', he: 'ידע כללי' },
        questions: [
            {
                text: { en: 'What is the capital of France?', he: 'מהי בירת צרפת?' },
                options: [
                    { text: { en: 'London', he: 'לונדון' } },
                    { text: { en: 'Berlin', he: 'ברלין' } },
                    { text: { en: 'Paris', he: 'פריז' } },
                    { text: { en: 'Madrid', he: 'מדריד' } }
                ],
                correctAnswerIndex: 2
            },
            {
                text: { en: 'Which planet is known as the Red Planet?', he: 'איזה כוכב לכת ידוע ככוכב האדום?' },
                options: [
                    { text: { en: 'Venus', he: 'נוגה' } },
                    { text: { en: 'Mars', he: 'מאדים' } },
                    { text: { en: 'Jupiter', he: 'צדק' } },
                    { text: { en: 'Saturn', he: 'שבתאי' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'Who wrote "Romeo and Juliet"?', he: 'מי כתב את "רומיאו ויוליה"?' },
                options: [
                    { text: { en: 'Charles Dickens', he: 'צ׳ארלס דיקנס' } },
                    { text: { en: 'William Shakespeare', he: 'ויליאם שייקספיר' } },
                    { text: { en: 'Mark Twain', he: 'מארק טוויין' } },
                    { text: { en: 'Jane Austen', he: 'ג׳יין אוסטן' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'What is the largest ocean on Earth?', he: 'מהו האוקיינוס הגדול ביותר בכדור הארץ?' },
                options: [
                    { text: { en: 'Atlantic Ocean', he: 'האוקיינוס האטלנטי' } },
                    { text: { en: 'Indian Ocean', he: 'האוקיינוס ההודי' } },
                    { text: { en: 'Arctic Ocean', he: 'אוקיינוס הקרח הצפוני' } },
                    { text: { en: 'Pacific Ocean', he: 'האוקיינוס השקט' } }
                ],
                correctAnswerIndex: 3
            },
            {
                text: { en: 'How many continents are there?', he: 'כמה יבשות יש?' },
                options: [
                    { text: { en: '5', he: '5' } },
                    { text: { en: '6', he: '6' } },
                    { text: { en: '7', he: '7' } },
                    { text: { en: '8', he: '8' } }
                ],
                correctAnswerIndex: 2
            }
        ]
    },
    {
        name: { en: 'Science', he: 'מדע' },
        questions: [
            {
                text: { en: 'What is the chemical symbol for water?', he: 'מהו הסמל הכימי למים?' },
                options: [
                    { text: { en: 'O2', he: 'O2' } },
                    { text: { en: 'H2O', he: 'H2O' } },
                    { text: { en: 'CO2', he: 'CO2' } },
                    { text: { en: 'NaCl', he: 'NaCl' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'What gas do plants absorb from the atmosphere?', he: 'איזה גז צמחים סופגים מהאטמוספירה?' },
                options: [
                    { text: { en: 'Oxygen', he: 'חמצן' } },
                    { text: { en: 'Carbon Dioxide', he: 'פחמן דו-חמצני' } },
                    { text: { en: 'Nitrogen', he: 'חנקן' } },
                    { text: { en: 'Hydrogen', he: 'מימן' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'What is the hardest natural substance on Earth?', he: 'מהו החומר הטבעי הקשה ביותר בכדור הארץ?' },
                options: [
                    { text: { en: 'Gold', he: 'זהב' } },
                    { text: { en: 'Iron', he: 'ברזל' } },
                    { text: { en: 'Diamond', he: 'יהלום' } },
                    { text: { en: 'Platinum', he: 'פלטינה' } }
                ],
                correctAnswerIndex: 2
            },
            {
                text: { en: 'Which organ pumps blood through the body?', he: 'איזה איבר מזרים דם בגוף?' },
                options: [
                    { text: { en: 'Brain', he: 'מוח' } },
                    { text: { en: 'Lungs', he: 'ריאות' } },
                    { text: { en: 'Heart', he: 'לב' } },
                    { text: { en: 'Liver', he: 'כבד' } }
                ],
                correctAnswerIndex: 2
            },
            {
                text: { en: 'What is the speed of light?', he: 'מהי מהירות האור?' },
                options: [
                    { text: { en: '300,000 km/s', he: '300,000 ק"מ/שנייה' } },
                    { text: { en: '150,000 km/s', he: '150,000 ק"מ/שנייה' } },
                    { text: { en: '1,000 km/s', he: '1,000 ק"מ/שנייה' } },
                    { text: { en: 'Sound speed', he: 'מהירות הקול' } }
                ],
                correctAnswerIndex: 0
            }
        ]
    },
    {
        name: { en: 'History', he: 'היסטוריה' },
        questions: [
            {
                text: { en: 'Who was the first President of the United States?', he: 'מי היה הנשיא הראשון של ארצות הברית?' },
                options: [
                    { text: { en: 'Thomas Jefferson', he: 'תומאס ג׳פרסון' } },
                    { text: { en: 'Abraham Lincoln', he: 'אברהם לינקולן' } },
                    { text: { en: 'George Washington', he: 'ג׳ורג׳ וושינגטון' } },
                    { text: { en: 'John Adams', he: 'ג׳ון אדמס' } }
                ],
                correctAnswerIndex: 2
            },
            {
                text: { en: 'In which year did World War II end?', he: 'באיזו שנה הסתיימה מלחמת העולם השנייה?' },
                options: [
                    { text: { en: '1945', he: '1945' } },
                    { text: { en: '1939', he: '1939' } },
                    { text: { en: '1918', he: '1918' } },
                    { text: { en: '1950', he: '1950' } }
                ],
                correctAnswerIndex: 0
            },
            {
                text: { en: 'Who discovered America?', he: 'מי גילה את אמריקה?' },
                options: [
                    { text: { en: 'Vasco da Gama', he: 'וסקו דה גאמה' } },
                    { text: { en: 'Christopher Columbus', he: 'כריסטופר קולומבוס' } },
                    { text: { en: 'Ferdinand Magellan', he: 'פרדיננד מגלן' } },
                    { text: { en: 'James Cook', he: 'ג׳יימס קוק' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'The French Revolution began in which year?', he: 'באיזו שנה החלה המהפכה הצרפתית?' },
                options: [
                    { text: { en: '1789', he: '1789' } },
                    { text: { en: '1776', he: '1776' } },
                    { text: { en: '1812', he: '1812' } },
                    { text: { en: '1492', he: '1492' } }
                ],
                correctAnswerIndex: 0
            },
            {
                text: { en: 'Who was the first man on the moon?', he: 'מי היה האדם הראשון על הירח?' },
                options: [
                    { text: { en: 'Yuri Gagarin', he: 'יורי גגארין' } },
                    { text: { en: 'Buzz Aldrin', he: 'באז אולדרין' } },
                    { text: { en: 'Neil Armstrong', he: 'ניל ארמסטרונג' } },
                    { text: { en: 'Michael Collins', he: 'מייקל קולינס' } }
                ],
                correctAnswerIndex: 2
            }
        ]
    },
    {
        name: { en: 'Entertainment', he: 'בידור' },
        questions: [
            {
                text: { en: 'Who played Jack in "Titanic"?', he: 'מי שיחק את ג׳ק ב"טיטאניק"?' },
                options: [
                    { text: { en: 'Brad Pitt', he: 'בראד פיט' } },
                    { text: { en: 'Leonardo DiCaprio', he: 'לאונרדו דיקפריו' } },
                    { text: { en: 'Tom Cruise', he: 'טום קרוז' } },
                    { text: { en: 'Johnny Depp', he: 'ג׳וני דפ' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'Which band released the album "Abbey Road"?', he: 'איזו להקה הוציאה את האלבום "Abbey Road"?' },
                options: [
                    { text: { en: 'The Rolling Stones', he: 'הרולינג סטונס' } },
                    { text: { en: 'Queen', he: 'קווין' } },
                    { text: { en: 'The Beatles', he: 'הביטלס' } },
                    { text: { en: 'Pink Floyd', he: 'פינק פלויד' } }
                ],
                correctAnswerIndex: 2
            },
            {
                text: { en: 'What is the highest-grossing film of all time?', he: 'מהו הסרט המכניס ביותר בכל הזמנים?' },
                options: [
                    { text: { en: 'Avatar', he: 'אווטאר' } },
                    { text: { en: 'Avengers: Endgame', he: 'הנוקמים: סוף המשחק' } },
                    { text: { en: 'Titanic', he: 'טיטאניק' } },
                    { text: { en: 'Star Wars', he: 'מלחמת הכוכבים' } }
                ],
                correctAnswerIndex: 0
            },
            {
                text: { en: 'Who is known as the "King of Pop"?', he: 'מי ידוע כ"מלך הפופ"?' },
                options: [
                    { text: { en: 'Elvis Presley', he: 'אלביס פרסלי' } },
                    { text: { en: 'Michael Jackson', he: 'מייקל ג׳קסון' } },
                    { text: { en: 'Prince', he: 'פרינס' } },
                    { text: { en: 'Madonna', he: 'מדונה' } }
                ],
                correctAnswerIndex: 1
            },
            {
                text: { en: 'Which TV show features dragons and the Iron Throne?', he: 'איזו סדרת טלוויזיה כוללת דרקונים ואת כס הברזל?' },
                options: [
                    { text: { en: 'The Witcher', he: 'המכשף' } },
                    { text: { en: 'Game of Thrones', he: 'משחקי הכס' } },
                    { text: { en: 'Vikings', he: 'ויקינגים' } },
                    { text: { en: 'Breaking Bad', he: 'שובר שורות' } }
                ],
                correctAnswerIndex: 1
            }
        ]
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Question.deleteMany({});
        await Subject.deleteMany({});
        console.log('Cleared existing subjects and questions');

        for (const subjectData of subjectsData) {
            const subject = await Subject.create({ name: subjectData.name });
            console.log(`Created subject: ${subject.name.en}`);

            const questions = subjectData.questions.map(q => ({
                ...q,
                subjectId: subject._id
            }));

            await Question.insertMany(questions);
            console.log(`Added ${questions.length} questions to ${subject.name.en}`);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
