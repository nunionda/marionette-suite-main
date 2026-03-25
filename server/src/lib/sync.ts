import fs from "fs";
import path from "path";

const SCRIPTS_DIR = path.resolve(__dirname, "..", "..", "..", "scripts");

const CATEGORY_MAP: Record<string, string> = {
  "Feature Film": "MOVIE",
  "Short Film": "SHORT",
  "Netflix Original": "DRAMA",
  "Commercial": "AD",
};

export const syncProjectToFileSystem = async (project: any) => {
  try {
    const prefix = CATEGORY_MAP[project.category] || "OTHER";
    const slug = project.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s_]/g, "") // Keep Korean, alphanumeric, spaces, AND underscores
      .trim()
      .replace(/\s+/g, "_");
      
    const projectDir = path.join(SCRIPTS_DIR, `${prefix}_${slug}`);

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const files = [
      { name: "outline.md", content: project.outline ? project.outline.map((s: any) => `S#${s.sceneNumber}. ${s.description}`).join('\n') : (project.concept || "") },
      { name: "treatment.md", content: project.treatment || "" },
      { name: "script.md", content: project.scenario || "" },
      { name: "characters.json", content: JSON.stringify(project.characters || {}, null, 2) },
      { name: "metadata.json", content: JSON.stringify({
        storyboardImages: project.storyboardImages || {},
        analysisData: project.analysisData || null,
        conceptBrief: project.conceptBrief || "",
        conceptDirection: project.conceptDirection || "",
        adDuration: project.adDuration || "30s"
      }, null, 2) },
    ];

    for (const file of files) {
      if (file.content) {
        fs.writeFileSync(path.join(projectDir, file.name), file.content);
      }
    }

    console.log(`[FS_SYNC] Synced project: ${project.title} -> ${projectDir}`);
  } catch (error) {
    console.error(`[FS_SYNC] Error syncing project ${project.id}:`, error);
  }
};
