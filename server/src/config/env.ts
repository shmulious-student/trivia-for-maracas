import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });
