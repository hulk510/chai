import { Configuration, OpenAIApi } from 'openai';
import { Readable } from 'stream';

export const getMessage = async (message: string): Promise<string> => {
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
  const stream = response.data as any as Readable;
  let streamHead = true; // Flag to indicate whether a message begins the stream or is a continuation
  let responseData = '';
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      try {
        const chunkString = chunk
          .toString()
          .trim()
          .replace(/\\n/g, '\\n')
          .replace(/\\'/g, "\\'")
          .replace(/\\"/g, '\\"')
          .replace(/\\&/g, '\\&')
          .replace(/\\r/g, '\\r')
          .replace(/\\t/g, '\\t')
          .replace(/\\b/g, '\\b')
          .replace(/\\f/g, '\\f');
        console.log(chunkString);
        if (chunkString.startsWith('data: ')) {
          const res = chunkString.replace('data: ', '');
          // if (res === '[DONE]') {
          //   stream.resume();
          //   return;
          // }
          const data = JSON.parse(res);
          if (streamHead) {
            responseData = data.choices[0].delta?.content || '';
            streamHead = false;
          } else {
            responseData += data.choices[0].delta?.content || '';
          }
        }
      } catch (error) {
        // End the stream but do not send the error, as this is likely the DONE message from createCompletion
        console.error(error);
      }
    });

    // Send the end of the stream on stream end
    stream.on('end', () => {
      resolve(responseData);
    });

    // If an error is received from the completion stream, send an error message and end the response stream
    stream.on('error', (error) => {
      // console.error(error);
      reject(error);
    });
  });
};
