#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logConversation = (topic, content) => {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toLocaleString();
  
  const filename = `${date}-${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
  const logDir = path.join(__dirname, '../docs/conversations');
  
  // Ensure directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const filepath = path.join(logDir, filename);
  
  const markdown = `# ${topic}

**Date:** ${timestamp}

## Content
${content}

---
`;

  fs.writeFileSync(filepath, markdown);
  console.log(`Conversation logged to: ${filepath}`);
  console.log(`File created: ${fs.existsSync(filepath) ? 'YES' : 'NO'}`);
};

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [topic, content] = process.argv.slice(2);
  if (!topic || !content) {
    console.log('Usage: node simple-logger.js "Topic" "Content"');
    process.exit(1);
  }
  
  logConversation(topic, content);
}

export { logConversation };
