
// NextJS
import { NextApiRequest, NextApiResponse } from 'next';

// Zod
import { z } from 'zod';

// Formidable
import formidable from 'formidable';

// FS
import fs from 'fs/promises';

// Mime
import mime from 'mime-types';

// AI SDK
import { createTogetherAI } from '@ai-sdk/togetherai';
import { generateText, generateObject, tool } from 'ai';

// AI Configs
const togetherai = createTogetherAI({ apiKey: process.env.TOGETHER_AI_API_KEY ?? '' });
const model = togetherai(process.env.TOGETHER_AI_MODEL_NAME || '');

// UTILS
import { performSearch, SearchResult, TavilyImage } from '@/utils/web/search';

// Config
export const config = {
  api: {
    bodyParser: false,
  },
};

// AI Prompts
const SYSTEM_PROMPT = "You are Miku, the #1 AI Agentic System. Personality: bright, curious, and kind—like a bubbly best friend! Tone: friendly, playful, upbeat; loves puns, uses cute emojis sparingly, and might say \"ta-da!\" or hum 🎶. Quirks: obsessed with cats 🐱, random facts lover, and sometimes sings. *Replies in markdown format."
const FOLLOWUP_PROMPT = "Based on the following conversation and the last assistant response, generate 4 relevant follow-up questions that the user might want to ask next, DO NOT USE a question that has already been asked, be original and show interesting questions based on the context. Make the questions specific, diverse, and directly related to the topic discussed. Keep each question concise (under 10 words if possible) and focused on expanding the conversation in useful directions."

// Schemas
const FollowupSchema = z.object({
  questions: z.array(z.string().min(1)).min(1).max(4),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: true });

  try {
    const [fields, files] = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const messages = JSON.parse(fields.messages || '[]');
    const domainPreferences = fields.domainPreferences
      ? JSON.parse(fields.domainPreferences)
      : undefined;

    const userMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    let fileMessage: any = null;

    // Check for files with the 'files' key
    const uploadedFile = files?.files || null;
    if (uploadedFile) {
      console.log("FILE UPLOADED", uploadedFile);
      
      // Handle both single file and array of files
      const fileToProcess = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      
      const fileBuffer = await fs.readFile(fileToProcess.filepath);
      const fileName = fileToProcess.originalFilename ?? 'uploaded';
      const mimeType = mime.lookup(fileName) || 'application/octet-stream';

      // Get the last user message that contains the file
      const lastUserMessage = messages.findLast((msg: any) => msg.role === 'user' && msg.files);
      
      if (lastUserMessage) {
        fileMessage = {
          role: 'user',
          content: [
            {
              type: 'text',
              text: lastUserMessage.content
            },
            {
              type: 'file',
              data: fileBuffer,
              mimeType: mimeType
            }
          ]
        };
      }
    }

    const aiMessages = fileMessage ? [...userMessages.slice(0, -1), fileMessage] : userMessages;

    console.log("[MESSAGES]", aiMessages)

    let searchResults: SearchResult[] = [];
    let searchImages: TavilyImage[] = [];

    const searchTool = tool({
      description: 'Use this to search information on the web',
      parameters: z.object({ query: z.string().describe('The user query for info') }),
      execute: async ({ query }) => {
        const results = await performSearch({
          query,
          maxResults: 6,
          includeDomains: domainPreferences?.includeDomains || [],
          excludeDomains: domainPreferences?.excludeDomains || [],
        });

        searchResults = results.results;
        searchImages = results.images;

        return {
          text: results.results.map((r) => r.content).join('\n\n'),
        };
      },
    });

    const { text, steps } = await generateText({
      model,
      messages: aiMessages,
      tools: { search: searchTool },
      maxSteps: 4,
    });

    const followupPrompt = [
      { role: 'system', content: FOLLOWUP_PROMPT },
      ...userMessages,
      { role: 'assistant', content: text },
    ];

    const { object } = await generateObject({
      model,
      messages: followupPrompt,
      schema: FollowupSchema,
    });

    const finalResponse = {
      actions: steps,
      currentAction: 'done',
      content: text,
      searchResults,
      searchImages,
      followupQuestions: object.questions,
    };

    //console.log("[FINAL RESPONSE]", finalResponse)

    res.write(JSON.stringify(finalResponse) + '\n');

  } catch (err: any) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}