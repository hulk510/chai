import { OpenAI } from 'langchain';
import { Configuration, OpenAIApi } from 'openai';

export const getLCMessage = async (message: string) => {
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
  });
  const res = await model.call(message);
  console.log(res);
  return res;
};

export const getMessage = async (message: string) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response =
    (
      await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0,
        max_tokens: 768,
      })
    ).data.choices[0].message?.content || '';
  return response;
};
