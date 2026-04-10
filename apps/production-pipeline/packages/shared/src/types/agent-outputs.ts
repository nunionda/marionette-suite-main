// ---------------------------------------------------------------------------
// Typed output schemas for pipeline agent step results
// ---------------------------------------------------------------------------

export interface CastingCharacter {
  name: string
  age_gender: string
  physical_description: string
  wardrobe: string
  expression_pose: string
  reference_actor: string
  image_prompt: string
  image_path?: string
  image_url?: string
}

export interface CastingDirectorOutput {
  characters: CastingCharacter[]
}

export interface LocationEntry {
  scene_numbers: number[]
  setting: string
  time_of_day: string
  description: string
  image_prompt: string
  image_path?: string
  image_url?: string
}

export interface LocationScoutOutput {
  locations: LocationEntry[]
}

export interface CinematographerScene {
  scene_number: number
  original_prompt: string
  enhanced_prompt: string
  lens: string
  camera_movement: string
  lighting: string
}

export interface CinematographerOutput {
  scenes: CinematographerScene[]
}
