import { formatEntries } from "../lib/format.js";
import { readEntriesForDate } from "../lib/store.js";

export function runToday(asJson: boolean) {
  const entries = readEntriesForDate(new Date());
  if (asJson) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }
  console.log(formatEntries(entries));
}
