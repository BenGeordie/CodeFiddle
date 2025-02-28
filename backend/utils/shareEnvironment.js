const Docker = require("dockerode");
const uuid4 = require("uuid4");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const docker = new Docker();

async function shareDockerImage(containerId) {
  const imageName = uuid4().replace(/-/g, '');
  const container = docker.getContainer(containerId);
  
  console.log("Committing container");
  // Commit with repository name including Docker Hub username
  await container.commit({
    repo: `${process.env.DOCKER_USERNAME}/oyster-env`,
    tag: imageName
  });

  const image = docker.getImage(`${process.env.DOCKER_USERNAME}/oyster-env:${imageName}`);
  
  console.log("Pushing image");
  // Push with authentication
  const stream = await image.push({
    authconfig: {
      username: process.env.DOCKER_USERNAME,
      password: process.env.DOCKER_PASSWORD,
      serveraddress: 'https://index.docker.io/v1/'
    }
  });
  
  console.log("Handling push stream");
  // Handle the push stream
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) reject(err);
      resolve(output);
    });
  });

  return `${process.env.DOCKER_USERNAME}/oyster-env:${imageName}`
}

function addOysterfileToProject(projectPath, imageName) {
  const oysterfilePath = path.join(projectPath, 'Oysterfile');
  fs.writeFileSync(oysterfilePath, `${process.env.DOCKER_USERNAME}/oyster-env:${imageName}`);
}

function pushToGit(projectPath) {
  try {
    execSync('git add Oysterfile', { cwd: projectPath });
    execSync('git commit -m "Add Oysterfile with environment configuration"', { cwd: projectPath });
    execSync('git push', { cwd: projectPath });
  } catch (err) {
    console.error("Error pushing to git:", err.message);
    throw new Error("Failed to push to git repository");
  }
}

function getRemoteOriginUrl(projectPath) {
  const gitConfigPath = path.join(projectPath, '.git', 'config');
  const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
  const remoteOriginUrl = gitConfig.match(/url = (.+)/)[1];
  return remoteOriginUrl;
}

async function shareEnvironment(projectPath, containerId) {
  const imageName = await shareDockerImage(containerId);
  addOysterfileToProject(projectPath, imageName);
  pushToGit(projectPath);
  const remoteOriginUrl = getRemoteOriginUrl(projectPath);
  return remoteOriginUrl;
}

module.exports = shareEnvironment;