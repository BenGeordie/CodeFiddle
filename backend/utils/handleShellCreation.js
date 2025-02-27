const path = require("path");
const processOutput = require("./processOutput");

const handleShellCreation = (container, ws, projectPath) => {
  container.exec(
    {
      Cmd: ["bin/bash", "-c", `cd ${projectPath.replace(`${process.env.HOME}`, "/localuser")} && /bin/bash`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    },
    (err, exec) => {
      console.log("err", err);
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
