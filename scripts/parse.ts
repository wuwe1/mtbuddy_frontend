interface Message {
  message: string;
  id: number;
  date: number;
}

export async function cleanUpTransactions(filename: string): Promise<void> {
  const MSG_PATTERN =
    /(?<amount>[0-9,.]+)\s+#(?<unit>\w+)\s+transferred\s+from\s+(?<from>#?[0-9a-zA-Z-. ]+)\s+to\s+(?<to>#?[0-9a-zA-Z-. ]+)/;

  const fileContent = await Deno.readTextFile(filename);
  const messages = JSON.parse(fileContent) as Array<Message>;

  const transactions = messages
    .filter((i) => i?.message?.trim().length > 0)
    .map((i) => {
      const matchResult = i.message.match(MSG_PATTERN);
      if (!matchResult) {
        return null;
      }

      const { amount, unit, from, to } = matchResult.groups as {
        amount: string;
        unit: string;
        from: string;
        to: string;
      };
      return {
        date: i.date,
        unit,
        value: Number(amount.replaceAll(",", "")),
        // add extra mark to break cricle
        source: `${from} (F)`,
        target: `${to} (T)`,
      };
    }).filter((i) => i !== null);

  await Deno.writeTextFile(
    "transactions.json",
    JSON.stringify(transactions, null, 2),
  );
}

if(import.meta.main) {
  cleanUpTransactions('messages.json')
}
