import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();
console.log('API Key from root .env:', process.env.RESEND_API_KEY);
