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
    { 
      type: "scene_heading", 
      text: "EXT. BRICK'S PATIO - DAY",
      metadata: { setting: "EXT.", location: "BRICK'S PATIO", time: "DAY" }
    },
    { type: "action", text: "A SUN-DRENCHED patio. BRICK (30s) sits alone." },
    { type: "character", text: "BRICK" },
    { type: "parenthetical", text: "(to himself)" },
    { type: "dialogue", text: "I'm just a brick in the wall." },
    { type: "transition", text: "CUT TO:" },
  ]);
});

test("parse generic Korean script conventions", () => {
  const script = `
S# 12. 경찰서 조사실 - 밤

비가 내린다. 어두운 조명.

형사 1
(책상을 치며)
어디서 거짓말이야!

용의자
진짜 모른다니까요.

암전
  `.trim();

  const elements = parseFountain(script);

  expect(elements).toEqual([
    { 
      type: "scene_heading", 
      text: "S# 12. 경찰서 조사실 - 밤",
      metadata: { setting: "S# 12", location: "경찰서 조사실", time: "밤" }
    },
    { type: "action", text: "비가 내린다. 어두운 조명." },
    { type: "character", text: "형사 1" },
    { type: "parenthetical", text: "(책상을 치며)" },
    { type: "dialogue", text: "어디서 거짓말이야!" },
    { type: "character", text: "용의자" },
    { type: "dialogue", text: "진짜 모른다니까요." },
    { type: "transition", text: "암전" }
  ]);
});
