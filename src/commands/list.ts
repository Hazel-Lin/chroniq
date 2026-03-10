import { formatDateSummary } from "../lib/format.js";
import { isValidDateKey, listAvailableDates, readEntriesForDateKey } from "../lib/store.js";

export function runList(date?: string, asJson = false) {
  if (date) {
    if (!isValidDateKey(date)) {
      console.error(`日期格式无效: ${date}（应为 YYYY-MM-DD）`);
      process.exit(1);
    }
    const entries = readEntriesForDateKey(date);
    if (asJson) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }
    console.log(formatDateSummary(date, entries));
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

  for (let i = 0; i < dates.length; i++) {
    if (i > 0) console.log();
    const entries = readEntriesForDateKey(dates[i]);
    console.log(formatDateSummary(dates[i], entries));
  }
}
