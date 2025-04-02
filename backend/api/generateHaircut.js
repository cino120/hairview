import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/generate-haircut', async (req, res) => {
  const { formatoRosto, tipoCabelo, tamanho, cor, estilo } = req.body;

  const promptBase = `Gere uma imagem realista de uma pessoa com rosto ${formatoRosto}, cabelo ${tipoCabelo}, corte ${tamanho}, cor ${cor}, estilo ${estilo}, fundo neutro. Mostre o corte de cabelo a partir de diferentes ângulos.`;

  try {
    const angles = ["frente", "lado direito", "trás", "lado esquerdo"];
    const imageUrls = [];

    for (const angulo of angles) {
      const prompt = `${promptBase} Vista do ângulo: ${angulo}.`;
      const response = await openai.createImage({
        prompt,
        n: 1,
        size: "512x512",
        response_format: "url",
      });
      imageUrls.push(response.data.data[0].url);
    }

    res.json({ images: imageUrls });
  } catch (error) {
    console.error("Erro ao gerar imagens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
