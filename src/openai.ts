import { PromptTemplate } from 'langchain';
import { AgentExecutor, loadAgent } from 'langchain/agents';
import { ConversationChain } from 'langchain/chains';
import { OpenAIChat } from 'langchain/llms';
import { BufferWindowMemory } from 'langchain/memory';
import { Calculator, SerpAPI } from 'langchain/tools';
import { Configuration, OpenAIApi } from 'openai';

interface Memories {
  [key: string]: BufferWindowMemory;
}
export const memories: Memories = {};
export const getAgentMessage = async (message: string) => {
  const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
    verbose: true,
  });
  const tools = [new SerpAPI(), new Calculator()];
  const agent = await loadAgent(
    'lc://agents/zero-shot-react-description/agent.json',
    { llm: model, tools }
  );
  console.log('Loaded agent from Langchain hub');

  const executor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    returnIntermediateSteps: true,
    verbose: true,
  });
  const result = await executor.call({ input: message });
  console.log(result);
  console.log(`Got agent output ${result.output}`);
  return result.output;
};

export const getLCMessage = async (
  message: string,
  memory: BufferWindowMemory
) => {
  const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
    verbose: true,
    prefixMessages: [
      { role: 'system', content: '英語で回答してください' },
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
