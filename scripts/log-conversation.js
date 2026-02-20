#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logConversation = (topic, content, metadata = {}) => {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    date: timestamp,
    topic,
    content,
    metadata
  };
  
  const filename = `${date}-${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(__dirname, '../docs/conversations', filename);
  
  const markdown = `# ${topic}

**Date:** ${timestamp}

## Summary
${metadata.summary || 'No summary provided'}

## Content
${content}

## Metadata
\`\`\`json
${JSON.stringify(metadata, null, 2)}
\`\`\`
`;

  fs.writeFileSync(filepath, markdown);
  console.log(`Conversation logged to: ${filepath}`);
};

// CLI usage
if (require.main === module) {
  const [topic, content] = process.argv.slice(2);
  if (!topic || !content) {
    console.log('Usage: node log-conversation.js "Topic" "Content"');
    process.exit(1);
  }
  
  logConversation(topic, content);
}

module.exports = { logConversation };
