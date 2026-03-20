import { expect, test } from "bun:test";

export function hello() {
  return "Hello from Antigravity!";
}

console.log(hello());

test("hello returns correct string", () => {
  expect(hello()).toBe("Hello from Antigravity!");
});