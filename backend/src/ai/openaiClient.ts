import OpenAI from 'openai';
import { config } from '../config';

// Falls back to a placeholder key so the SDK can be constructed even when no
// key is configured yet; calls will fail with a clear auth error at request
// time instead of crashing the whole backend at startup.
export const openai = new OpenAI({ apiKey: config.openaiApiKey || 'sk-not-configured' });
