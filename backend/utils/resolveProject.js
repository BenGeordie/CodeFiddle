const fs = require("fs");
const path = require("path");


function readProjectDatabase() {
  const databasePath = path.resolve(__dirname, "../database/projectDatabase.json");
  let projectDatabase = {};
  try {
    const database = fs.readFileSync(databasePath, "utf8");
    projectDatabase = JSON.parse(database);
  } catch (err) {
    // Create database file if it doesn't exist
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    fs.writeFileSync(databasePath, JSON.stringify({}));
  }
  return projectDatabase;
}

function resolveProjectPath(projectPathOrLink) {
  if (!projectPathOrLink.endsWith(".git")) {
    return projectPathOrLink;
  }
  // Check database (txt file) if we have cloned this project before
  // If we have, check if the project is still at that location
  // If it is, return the path
  const projectDatabase = readProjectDatabase();
  if (projectDatabase[projectPathOrLink]) {
    const savedPath = projectDatabase[projectPathOrLink];
    if (fs.existsSync(savedPath)) {
      return savedPath;
    }
  }
  // We can't find the the project in our file system. Clone it.
  const projectName = projectPathOrLink.split('/').pop().replace('.git', '');
  const projectsDir = path.resolve(__dirname, '../projects');
  const projectPath = path.join(projectsDir, projectName);

  // Create projects directory if it doesn't exist
  fs.mkdirSync(projectsDir, { recursive: true });

  // Clone the repository
  const { execSync } = require('child_process');
  try {
    execSync(`git clone ${projectPathOrLink} ${projectPath}`);
  } catch (err) {
    throw new Error(`Failed to clone repository: ${err.message}`);
  }

  // Update database with new project path
  projectDatabase[projectPathOrLink] = projectPath;
  fs.writeFileSync(databasePath, JSON.stringify(projectDatabase, null, 2));

  return projectPath;
}

module.exports = resolveProjectPath;