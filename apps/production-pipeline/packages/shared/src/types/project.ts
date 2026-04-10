// ---------------------------------------------------------------------------
// Project & Direction Plan types — mirrors Python Pydantic models
// ---------------------------------------------------------------------------

export const ProjectStatus = {
  DRAFT: "draft",
  PRE_PRODUCTION: "pre_production",
  MAIN_PRODUCTION: "main_production",
  POST_PRODUCTION: "post_production",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

// ---------------------------------------------------------------------------
// Scene & DirectionPlan (from src/models/schemas.py)
// ---------------------------------------------------------------------------

export interface Cut {
  cut_number: number;
  shot_type: string;         // WIDE SHOT, CLOSE UP, MEDIUM SHOT, etc.
  camera_angle: string;      // Eye level, High angle, Low angle, Dutch angle
  camera_movement: string;   // Static, Pan, Tilt, Dolly, Crane, Steadicam
  duration: number;          // seconds (3-8)
  subject: string;
  action: string;
  image_prompt: string;
  video_prompt: string;
}

export interface Scene {
  scene_number: number;
  sequence?: number;
  setting: string;
  time_of_day: string;
  camera_angle: string;
  action_description: string;
  dialogue: string | null;
  image_prompt: string;
  video_prompt: string;
  cuts?: Cut[];
}

export interface DirectionPlan {
  title: string;
  logline: string;
  genre: string;
  target_audience: string;
  planning_intent: string;
  worldview_settings: string;
  character_settings: string;
  global_audio_concept: string;
  scenes: Scene[];
}

// ---------------------------------------------------------------------------
// API request / response shapes (from server/models/schemas.py)
// ---------------------------------------------------------------------------

export interface ProjectCreate {
  title: string;
  genre: string;
  logline: string;
  idea: string;
}

export interface ProjectUpdate {
  title?: string;
  genre?: string;
  logline?: string;
  idea?: string;
  status?: ProjectStatus;
  protagonist?: string;
  antagonist?: string;
  worldview?: string;
  script?: string;
}

export interface ProjectResponse {
  id: string;
  title: string;
  genre: string;
  logline: string;
  idea: string;
  status: ProjectStatus;
  progress: number;
  protagonist: string | null;
  antagonist: string | null;
  worldview: string | null;
  script: string | null;
  direction_plan_json: DirectionPlan | null;
  created_at: string;
  updated_at: string;
}
