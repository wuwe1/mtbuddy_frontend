import { sessions } from "npm:telegram@2.15.5";
import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import { blue } from "https://deno.land/std@0.178.0/fmt/colors.ts";
import {
  connectAsUser,
  fetchHistoryInRange,
  getLatestMessageIdOfChannel,
  Message
} from "./utils.ts";
const CHANNEL = "misttrack_alert";
const MESSAGES = "messages.json";

const dedup = (arr: Message[]) => {
  const uniqueItems = new Set();
  return arr.filter((obj) => {
    if (!uniqueItems.has(obj.id)) {
      uniqueItems.add(obj.id)
      return true
    }
    return false
  })
}


if (import.meta.main) {
  // check if old message file exist
  let old;
  try {
    const decoder = new TextDecoder();
    const buf = await Deno.readFile(MESSAGES);
    const decoded = decoder.decode(buf);
    old = JSON.parse(decoded);
  } catch (err) {
    console.error(err);
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    old = [];
  }

  const largestOldId = old.length === 0 ? 0 : old[0].id;

  // authentication
  const apiId = Number(Deno.env.get("API_ID"));
  const apiHash = Deno.env.get("API_HASH") as string;
  const stringSession = new sessions.StringSession(Deno.env.get("SESSION"));
  const client = await connectAsUser({ stringSession, apiId, apiHash });

  // fetch new messages
  const latestId = await getLatestMessageIdOfChannel(client, CHANNEL);
  console.log(
    `from ${blue(latestId.toString())} to ${blue(largestOldId.toString())}`,
  );
  let newMessages = await fetchHistoryInRange(
    client,
    CHANNEL,
    latestId,
    largestOldId,
  );
  newMessages = newMessages.map((i) => {
    const { message, id, date } = i;
    return { message, id, date };
  });

  // deuplicate and write
  const messages = dedup([...newMessages, ...old])
  await Deno.writeTextFile(MESSAGES, JSON.stringify(messages));

  await client.destroy();
  Deno.exit(0);
}
