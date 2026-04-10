import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AI Engine Prompt Snapshots', () => {
  const rulesPath = path.resolve(__dirname, '../.agents/rules');
  
  const rulesFiles = [
    'AD_ENGINE.md',
    'categories.md',
    'scenario_writer.md'
  ];

  rulesFiles.forEach(file => {
    it(`should match snapshot for ${file}`, () => {
      const filePath = path.join(rulesPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toMatchSnapshot();
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    });
  });
});
