import fs from 'fs';
import pdf from 'pdf-parse';
import { parseFountain, ScriptElement } from './parser';

/**
 * Extracts text from a PDF screenplay and attempts to parse it using the Fountain parser.
 * Note: PDF parsing may lose some indentation information, which could affect the Fountain parser's accuracy.
 * Advanced layout analysis based on coordinate positioning would be needed for production-grade accuracy.
 * 
 * @param filePath Path to the PDF file
 * @returns Array of parsed script elements
 */
export async function parsePdfToFountainElements(filePath: string): Promise<ScriptElement[]> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    // Feed the extracted text into the Fountain parser
    return parseFountain(data.text);
  } catch (error) {
    console.error(`Failed to parse PDF at ${filePath}:`, error);
    throw error;
  }
}
