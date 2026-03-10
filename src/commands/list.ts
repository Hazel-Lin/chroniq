import { formatEntries } from "../lib/format.js";
import { listAvailableDates, readEntriesForDateKey } from "../lib/store.js";

export function runList(date?: string, asJson = false) {
  if (date) {
    const entries = readEntriesForDateKey(date);
    if (asJson) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }
    console.log(formatEntries(entries));
    return;
  }

  const dates = listAvailableDates();
  if (asJson) {
    console.log(JSON.stringify(dates, null, 2));
    return;
  }

  if (dates.length === 0) {
    console.log("暂无记录");
    return;
  }

  for (const dateKey of dates) {
    const count = readEntriesForDateKey(dateKey).length;
    console.log(`${dateKey} (${count})`);
  }
}
