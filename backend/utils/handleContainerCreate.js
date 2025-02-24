const Docker = require("dockerode");

const docker = new Docker();

async function checkImageExists(imageId) {
  try {
      // First check locally
      try {
          await docker.getImage(imageId).inspect();
          return { exists: true, location: 'local' };
      } catch (localError) {
          // Image not found locally, check Docker Hub
          const stream = await docker.pull(imageId);
          
          // Wait for the pull to complete
          await new Promise((resolve, reject) => {
              docker.modem.followProgress(stream, (err, result) => {
                  if (err) reject(err);
                  resolve(result);
              });
          });
          
          return { exists: true, location: 'remote' };
      }
  } catch (error) {
      // Image not found either locally or on Docker Hub
      return { exists: false, location: null };
  }
}

const getExistingContainerByNameOrIdOrImageId = async (environment) => {
  console.log("Getting existing container", environment);
  const containers = await docker.listContainers({ all: true });
  for (const container of containers) {
    console.log("Container meta", container.Names, container.Id, container.Image);
    if (container.Names.includes(environment) || container.Id.startsWith(environment) || container.Image === environment) {
      console.log("Container found", container.Id);
      return docker.getContainer(container.Id);
    }
  }
};

const makeContainerByImageId = async (environment) => {
  const imageExists = await checkImageExists(environment);
  if (imageExists.exists) {
    const container = await docker.createContainer({
      Image: environment,
      AttachStderr: true,
      AttachStdin: true,
      AttachStdout: true,
      Cmd: "/bin/bash".split(" "),
      Tty: true,
      HostConfig: {
        Binds: [
          `${process.env.HOME}/:/localuser/`
        ],
        PortBindings: {
          "5173/tcp": [{ HostPort: "0" }],
        },
      },
      ExposedPorts: {
        "5173/tcp": {},
      },
    });
    console.log("Container created", container.id);
    return container;
  }
};

const handleContainerCreate = async (playgroundId, wsForShell, req, socket, head, environment) => {
  try {
    let container = await getExistingContainerByNameOrIdOrImageId(environment);

    if (!container) {
      container = await makeContainerByImageId(environment);
    }
    
    if (!container) {
      container = await getExistingContainerByNameOrIdOrImageId("oyster_base");
    }
    
    if (!container) {
      container = await makeContainerByImageId("oyster_base");
    }
    
    if (!container) {
      throw new Error("Could not create container");
    }

    const containerInfo = await container.inspect();
    if (!containerInfo.State.Running) {
      await container.start();
    }
    
    wsForShell.handleUpgrade(req, socket, head, (ws) => {
      wsForShell.emit("connection", ws, req, container, playgroundId);
    });

  } catch (err) {
    console.error('Error in handleContainerCreate:', err);
  }
};

module.exports = handleContainerCreate;
