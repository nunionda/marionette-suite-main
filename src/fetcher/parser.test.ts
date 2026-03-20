import { expect, test } from "bun:test";
import { parseFountain } from "./parser.ts";

test("parse simple fountain script", () => {
  const script = `
EXT. BRICK'S PATIO - DAY

A SUN-DRENCHED patio. BRICK (30s) sits alone.

BRICK
(to himself)
I'm just a brick in the wall.

CUT TO:
  `.trim();

  const elements = parseFountain(script);

  expect(elements).toEqual([
    { type: "scene_heading", text: "EXT. BRICK'S PATIO - DAY" },
    { type: "action", text: "A SUN-DRENCHED patio. BRICK (30s) sits alone." },
    { type: "character", text: "BRICK" },
    { type: "parenthetical", text: "(to himself)" },
    { type: "dialogue", text: "I'm just a brick in the wall." },
    { type: "transition", text: "CUT TO:" },
  ]);
});
