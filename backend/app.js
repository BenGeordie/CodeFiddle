const express = require("express");
const path = require("path");

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { WebSocketServer } = require("ws");
const querystring = require("querystring");
const cors = require("cors");
const chokidar = require("chokidar");
const dotenv = require('dotenv');

const indexRouter = require("./routes/index");

const handleMonacoWebSocketEvents = require("./utils/handleMonacoWebSocketEvents");
const handleContainerCreate = require("./utils/handleContainerCreate");
const handleShellCreation = require("./utils/handleShellCreation");

const app = express();

dotenv.config();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);

const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const wsForMonaco = new WebSocketServer({
  noServer: true,
});

const wsForShell = new WebSocketServer({
  noServer: true,
});

wsForMonaco.on("connection", (ws, req) => {
  const params = querystring.parse(req.url.split("?")[1]);
  const projectPath = params.projectPath;
  if (projectPath) {
    const watcher = chokidar.watch(
      projectPath,
      {
        persistent: true,
        ignoreInitial: true,
        // TODO: Can I not ignore? Should I adjust what gets ignored based on the project?
        ignored: (path) => path.includes("node_modules"),
        awaitWriteFinish: { stabilityThreshold: 2000 },
      }
    );
    watcher.on("all", (event, path) => {
      if (event !== "change") {
        const message = {
          type: "validateFolderStructure",
          payload: {
            data: null,
            path: null,
          },
        };
        ws.send(JSON.stringify(message));
      }
    });
    ws.on("message", (message) => {
      const finalMessage = JSON.parse(message.toString());
      handleMonacoWebSocketEvents(
        ws,
        finalMessage.type,
        finalMessage.payload.data,
        finalMessage.payload.path
      );
    });
    ws.on("close", async () => {
      await watcher.close();
      console.log("Connection Closed for monaco");
    });
  }
});

wsForShell.on("connection", (ws, req, container, projectPath) => {
  handleShellCreation(container, ws, projectPath);
  ws.send(JSON.stringify({ type: "containerId", payload: { containerId: container.id } }));
});

server.on("upgrade", (req, socket, head) => {
  const isShell = req.url.includes("/shell");

  if (!isShell) {
    wsForMonaco.handleUpgrade(req, socket, head, (ws) => {
      wsForMonaco.emit("connection", ws, req);
    });
  } else {
    const { projectPath, environment } = querystring.parse(req.url.split("?")[1]);
    handleContainerCreate(projectPath, wsForShell, req, socket, head, environment);
  }
});
