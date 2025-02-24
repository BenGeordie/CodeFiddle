const Docker = require("dockerode");

const docker = new Docker();

const handleContainerCreate = async (playgroundId, wsForShell, req, socket, head) => {
  try {
    // First check for existing containers
    const containers = await docker.listContainers({
      filters: {
        ancestor: ['oyster_base'],
        status: ['running']
      }
    });

    let container;
    
    if (containers.length > 0) {
      container = docker.getContainer(containers[0].Id);
    } else {
      console.log("creating new container");
      // Create new container if none exists
      container = await docker.createContainer({
        Image: "oyster_base",
        AttachStderr: true,
        AttachStdin: true,
        AttachStdout: true,
        Cmd: "/bin/bash".split(" "),
        Tty: true,
        // TODO: What is this for?
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
