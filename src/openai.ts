import { ConversationChain } from 'langchain/chains';
import { OpenAIChat } from 'langchain/llms';
import { BufferMemory } from 'langchain/memory';
import { Configuration, OpenAIApi } from 'openai';

const memory = new BufferMemory();
export const getLCMessage = async (message: string) => {
  const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
    prefixMessages: [
      { role: 'user', content: '私の名前はジョンです' },
      { role: 'assistant', content: 'こんにちは' },
    ],
  });

  const chain = new ConversationChain({ llm: model, memory: memory });
  const res = await chain.call({ input: message });
  console.log(res);
  return res.response;
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
