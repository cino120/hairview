import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const readImageAsBase64 = (filePath) => {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
};

router.post('/analyze-face', upload.fields([{ name: 'front' }, { name: 'side' }]), async (req, res) => {
  try {
    const frontPath = req.files.front[0].path;
    const sidePath = req.files.side[0].path;

    const frontImageBase64 = readImageAsBase64(frontPath);
    const sideImageBase64 = readImageAsBase64(sidePath);

    const response = await openai.createChatCompletion({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em visagismo. Analise o rosto e cabelo do cliente.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise o formato do rosto e o tipo de cabelo com base nessas imagens. Responda com um JSON: { formatoRosto, tipoCabelo, observacoes }',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${frontImageBase64}` },
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${sideImageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const analysis = response.data.choices[0].message.content;
    res.json({ success: true, analysis });

    fs.unlinkSync(frontPath);
    fs.unlinkSync(sidePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
