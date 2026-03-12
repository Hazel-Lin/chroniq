import test from "node:test";
import assert from "node:assert/strict";
import { renderWelcomeScreen } from "../src/lib/welcome.js";

test("welcome screen renders static welcome card and command tips", () => {
  const output = renderWelcomeScreen();

  assert.match(output, />_ Chroniq/);
  assert.match(output, /chroniq add "今天的想法 #idea"/);
  assert.match(output, /chroniq add --stdin/);
  assert.match(output, /chroniq --help/);
  assert.doesNotMatch(output, /Type to log a note, or use \/help/);
});
