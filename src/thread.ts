import * as fs from 'fs';

const write_json = (filename: string, obj: ThreadLog) => {
  fs.writeFileSync(filename, JSON.stringify(obj, null, '\t'));
};

const read_json = (filename: string): string => {
  return fs.readFileSync(filename, 'utf8');
};

interface ThreadLog {
  threads: ThreadData[]; // チャンネルIDとユーザーIDの配列
}
interface ThreadData {
  thread_ch_id: string; // チャンネルID
  user_id: string; // ユーザーID
}

const thread_log_filename = 'thread_log.json';
// thread_log.jsonが存在していれば読み込み、無ければthreads配列を作成
export const readThreadLog = (): ThreadLog => {
  let thread_log: ThreadLog = { threads: [] };
  try {
    const str = read_json(thread_log_filename);
    thread_log = JSON.parse(str);
  } catch (err) {
    thread_log.threads = new Array();
  }
  return thread_log;
};

export const writeThreadLog = (channelId: string, authorId: string) => {
  let thread_log = readThreadLog();
  let obj = {
    thread_ch_id: channelId,
    user_id: authorId,
  };
  thread_log.threads.push(obj);
  try {
    write_json(thread_log_filename, thread_log);
  } catch (err) {
    console.log(err);
    throw new Error("Can't write thread_log.json: " + err);
  }
};

export const isGPTThread = (threadChannelId: string): boolean => {
  const threadLog = readThreadLog();
  return threadLog.threads.some(
    (thread) => thread.thread_ch_id === threadChannelId
  );
};
