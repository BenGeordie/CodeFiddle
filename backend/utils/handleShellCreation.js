const path = require("path");
const processOutput = require("./processOutput");

const handleShellCreation = (container, ws, playgroundId) => {
  console.log(["bin/bash", "-c", `cd ${path.resolve(__dirname + "/../playgrounds/" + playgroundId + "/code").replace(`${process.env.HOME}`, "/localuser")} && /bin/bash`])
  container.exec(
    {
      Cmd: ["bin/bash", "-c", `cd ${path.resolve(__dirname + "/../playgrounds/" + playgroundId + "/code").replace(`${process.env.HOME}`, "/localuser")} && /bin/bash`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      User: "ubuntu",
    },
    (err, exec) => {
      console.log(err);s
      exec.start(
        {
          stdin: false,
          hijack: true,
        },
        (err, stream) => {
          processOutput(stream, ws);
          ws.on("message", (message) => {
            stream.write(message);
          });
        }
      );
    }
  );
};

module.exports = handleShellCreation;
