import { sessions, TelegramClient, tl } from "npm:telegram@2.15.5";
import { pooledMap } from "https://deno.land/std@0.178.0/async/pool.ts";
const { Api } = tl;

export interface Message {
  id: number;
  date: number;
  message: string;
}

export interface ChannelMessage {
  messages: Message[];
}

export interface GetHisotryOptions {
  skip?: number;
  limit?: number;
  maxId?: number;
  minId?: number;
}

export interface ConnectAsUserOptions {
  apiId: number;
  apiHash: string;
  stringSession: sessions.StringSession;
}

function* range(from: number, to: number) {
  for (let i = from; i < to; i++) yield i;
}

/**
 * Get conversation history within a chat
 * https://core.telegram.org/method/messages.getHistory
 */
export const getHistory = async (
  client: TelegramClient,
  peer: string,
  options: GetHisotryOptions = { skip: 0, limit: 100 },
) => {
  return await client.invoke(
    new Api.messages.GetHistory({
      peer,
      addOffset: options.skip,
      limit: options.limit,
    }),
  );
};

export const getLatestMessageIdOfChannel = async (
  client: TelegramClient,
  channel: string,
) => {
  const { messages } = await getHistory(
    client,
    channel,
    {
      skip: 0,
      limit: 1,
    },
  ) as ChannelMessage;
  return messages[0].id;
};

export const fetchHistoryInRange = async (
  client: TelegramClient,
  channel: string,
  fromId: number,
  toId: number,
) => {
  const PAGE_SIZE = 100;
  const lastPage = Math.ceil((fromId - toId) / PAGE_SIZE);
  let results: Message[] = []
  const map = pooledMap(
    1,
    [...range(0, lastPage)],
    (page) =>
      getHistory(client, channel, { skip: page * PAGE_SIZE, limit: PAGE_SIZE }),
  ) as AsyncIterableIterator<ChannelMessage>;

  let counter = 0
  for await (const {messages} of map) {
    console.log(`${counter}/${lastPage}`)
    console.log(messages.length)
    results = [...results, ...messages];
    counter++;
  }
  return results
};

/**
 * Connect as a user
 * https://gram.js.org/getting-started/authorization#logging-in-as-a-user
 */
export const connectAsUser = async (options: ConnectAsUserOptions) => {
  const { stringSession, apiId, apiHash } = options;
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  return client;
};
