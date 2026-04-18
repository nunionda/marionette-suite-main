import type { PromptAdapter } from "./adapter";

/**
 * Placeholder — Phase 2 will implement real Cinema Studio 3.5 rendering.
 * Current output is a structured description for manual paste into Higgsfield UI.
 */
export const cinemaStudioAdapter: PromptAdapter = {
  id: "higgsfield-cinema-studio-3.5",
  product: "cinema-studio-3.5",
  renderImage(prompt, ctx) {
    const chars = prompt.characters.map((c) => c.name).join(", ");
    const refs = prompt.style.reference?.join(" / ") ?? "";
    const text = [
      `[CINEMA STUDIO 3.5 — ${ctx.category}] ${ctx.projectTitle}`,
      `SHOT: ${prompt.cutId}`,
      `LOCATION: ${prompt.location.name}`,
      `CHARACTERS: ${chars}`,
      `LIGHTING: ${prompt.lighting.key}, ${prompt.lighting.timeOfDay ?? ""}`,
      `CAMERA: ${prompt.camera.angle ?? "eye-level"}, ${prompt.camera.lens ?? "normal"}`,
      `STYLE: ${prompt.style.tone ?? ""} ${refs ? `(ref: ${refs})` : ""}`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "cinema-studio-3.5", cutId: prompt.cutId } };
  },
  renderVideo(prompt, ctx) {
    const text = [
      `[CINEMA STUDIO 3.5 — VIDEO — ${ctx.category}]`,
      `SHOT: ${prompt.cutId}`,
      `MOTION: ${prompt.motion.action} (${prompt.motion.intensity ?? "moderate"})`,
      `CAMERA MOVE: ${prompt.cameraMove.type}, ${prompt.cameraMove.speed ?? "medium"}`,
      `DURATION: ${prompt.durationSeconds}s`,
      ``,
      prompt.description,
    ].join("\n");
    return { text, metadata: { product: "cinema-studio-3.5", cutId: prompt.cutId } };
  },
};
