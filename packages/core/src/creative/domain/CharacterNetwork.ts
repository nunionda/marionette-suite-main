export interface CharacterNode {
  name: string;
  totalLines: number;     // Number of dialogue lines
  totalWords: number;     // Volume of words spoken
  role: "Protagonist" | "Antagonist" | "Supporting" | "Minor";
}

export interface CharacterNetwork {
  scriptId: string;
  characters: CharacterNode[];
}
