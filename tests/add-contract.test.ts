import test from "node:test";
import assert from "node:assert/strict";
import { AddContractError, resolveAddContract } from "../src/lib/add-contract.js";

test("resolveAddContract keeps direct content as argv mode", () => {
  const contract = resolveAddContract("hello", { tags: ["idea"] });
  assert.equal(contract.sourceMode, "argv");
  assert.equal(contract.content, "hello");
  assert.deepEqual(contract.tags, ["idea"]);
});

test("resolveAddContract marks empty input as batch mode", () => {
  const contract = resolveAddContract(undefined, { tags: [] });
  assert.equal(contract.sourceMode, "batch");
});

test("resolveAddContract rejects conflicting sources", () => {
  assert.throws(
    () => resolveAddContract("hello", { tags: [], multiline: true }),
    AddContractError,
  );
});
