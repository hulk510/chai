import { Configuration, OpenAIApi } from 'openai';
// https://vercel.com/blog/gpt-3-app-next-js-vercel-edge-functions
export const getMessageStream = async (message: string) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createChatCompletion(
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0,
      stream: true,
      max_tokens: 1024,
    },
    { responseType: 'stream' }
  );
  return response.data;
};
