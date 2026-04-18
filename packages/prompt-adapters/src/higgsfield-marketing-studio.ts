import type { PromptAdapter } from "./adapter";

export const marketingStudioAdapter: PromptAdapter = {
  id: "higgsfield-marketing-studio",
  product: "marketing-studio",
  renderImage(prompt, ctx) {
    const text = [
      `[MARKETING STUDIO — ${ctx.category}] ${ctx.projectTitle}`,
      `AD FORMAT HINT: ${ctx.category === "youtube" ? "UGC / vertical" : "CGI / horizontal"}`,
      `LOCATION: ${prompt.location.name}`,
      `PRODUCTS/PROPS: ${prompt.props.map((p) => p.name).join(", ")}`,
      `STYLE: ${prompt.style.tone ?? ""}`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "marketing-studio", cutId: prompt.cutId } };
  },
  renderVideo(prompt, ctx) {
    const text = [
      `[MARKETING STUDIO — VIDEO — ${ctx.category}]`,
      `MOTION: ${prompt.motion.action}`,
      `CAMERA MOVE: ${prompt.cameraMove.type}`,
      `DURATION: ${prompt.durationSeconds}s`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "marketing-studio", cutId: prompt.cutId } };
  },
};
