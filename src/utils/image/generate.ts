import Together from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? ''
});

interface TogetherError extends Error {
  response?: {
    data?: any;
  };
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log("[GENERATE IMAGE]\n", prompt);

    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt,
      width: 512,
      height: 512,
      steps: 4,
    });

    if (!response.data?.[0]?.url) {
      console.error("[GENERATE IMAGE] Invalid response format:", response);
      throw new Error('No image URL in response');
    }

    // Return the image URL directly
    return response.data[0].url;

  } catch (error) {
    const togetherError = error as TogetherError;
    console.error('[GENERATE IMAGE] Error details:', {
      name: togetherError.name,
      message: togetherError.message,
      stack: togetherError.stack,
      response: togetherError.response?.data
    });
    throw error;
  }
}