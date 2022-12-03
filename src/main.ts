import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

(async () => {
  const response = (
    await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: 'やっほーこんにちは、今日の運勢を教えてください',
      temperature: 0,
      max_tokens: 512,
    })
  ).data.choices[0].text;
  console.log(response);
})();
