const fs = require('fs');
const path = require('path');

async function resolveEnvironment(projectPath) {
  const oysterfilePath = path.join(projectPath, 'Oysterfile');
  
  if (fs.existsSync(oysterfilePath)) {
    const contents = fs.readFileSync(oysterfilePath, 'utf8');
    const lines = contents.split('\n');
    return lines.find(line => line.trim().length > 0);
  }
}

module.exports = resolveEnvironment;
