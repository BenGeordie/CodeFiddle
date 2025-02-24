const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const uuid4 = require("uuid4");
const directoryTree = require("directory-tree");

router
  .get("/tree/:playgroundId", (req, res) => {
    const playgroundId = req.params.playgroundId;
    const playGroundPath = path.resolve(
      playgroundId
    );
    const tree = directoryTree(playGroundPath);
    res.json(tree);
  });

module.exports = router;
