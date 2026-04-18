"use server";

import { revalidatePath } from "next/cache";
import { serviceUrl } from "@marionette/config";

const API_BASE_URL = serviceUrl("pipelineApi", "/api");
const VAULT_URL = `${API_BASE_URL}/vault`;

export interface Credential {
  id: string;
  provider: string;
  key_name: string;
  is_active: boolean;
}

export async function listCredentials(): Promise<Credential[]> {
  try {
    const response = await fetch(`${VAULT_URL}/credentials`, { cache: "no-store" });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return [];
  }
}

export async function saveCredential(provider: string, apiKey: string, keyName = "default") {
  try {
    const response = await fetch(`${VAULT_URL}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, api_key: apiKey, key_name: keyName }),
    });
    if (!response.ok) throw new Error("Failed to save credential");
    revalidatePath("/settings/vault");
    return await response.json();
  } catch (error) {
    console.error("Error saving credential:", error);
    throw error;
  }
}
