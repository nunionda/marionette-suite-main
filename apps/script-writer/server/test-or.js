import { fetch } from 'bun';

async function testOpenRouter() {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer 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`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "black-forest-labs/flux/schnell",
      messages: [{ role: "user", content: "A cool dog" }]
    })
  });
  console.log(await res.json());
}
testOpenRouter();
