import { formatEntries } from "../lib/format.js";
import { readEntriesForDate } from "../lib/store.js";

export function runToday(asJson: boolean) {
  const entries = readEntriesForDate(new Date());
  if (asJson) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }
  if (entries.length === 0) {
    console.log("今天暂无记录，试试 cq add \"你的第一条记录\"");
    return;
  }
  console.log(`今天 (${entries.length} 条)`);
  console.log(formatEntries(entries));
}
