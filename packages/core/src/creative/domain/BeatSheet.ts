export interface Beat {
  act: number;          // 1, 2, or 3
  name: string;         // e.g., "Inciting Incident", "Plot Point 1", "Midpoint", "Climax"
  sceneStart: number;   // The scene number where this beat begins
  sceneEnd: number;     // The scene number where this beat resolves
  description: string;  // Analytical explanation of the plot point
}

export interface BeatSheet {
  scriptId: string;
  beats: Beat[];
}
