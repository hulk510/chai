import { PromptTemplate } from 'langchain';
import { ConversationChain } from 'langchain/chains';
import { OpenAIChat } from 'langchain/llms';
import { BufferWindowMemory } from 'langchain/memory';
import { Configuration, OpenAIApi } from 'openai';

interface Memories {
  [key: string]: BufferWindowMemory;
}
export const memories: Memories = {};

export const getLCMessage = async (
  message: string,
  memory: BufferWindowMemory
) => {
  const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
    prefixMessages: [
      { role: 'system', content: '日本語で回答してください' },
      { role: 'assistant', content: 'こんにちは' },
      { role: 'user', content: '短くできる限りわかりやすく簡潔に' },
    ],
  });

  const prompt = new PromptTemplate({
    template:
      '{target}に関する、Twitterで人を惹きつける魅力的な文章を考えてください。',
    inputVariables: ['target'],
  });

  // LLMChainのの違いは？
  const chain = new ConversationChain({
    llm: model,
    memory: memory,
    prompt: prompt,
  });
  const res = await chain.call({
    target: message,
  });
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
