import { Configuration, OpenAIApi } from 'openai';

export const getMessage = async (message: string) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = (
    await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0,
      max_tokens: 1024,
    })
  ).data.choices[0].message?.content;
  return response;
};
