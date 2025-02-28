const Docker = require("dockerode");
const uuid4 = require("uuid4");

const docker = new Docker();

async function shareEnvironment(containerId) {
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

module.exports = shareEnvironment;