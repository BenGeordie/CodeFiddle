const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Docker = require('dockerode');
const docker = new Docker(); // Connects to default socket

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
  })
  .post("/share", async (req, res) => {
    try {
      const { containerId } = req.body;
      if (!containerId) {
        return res.status(400).json({ error: "Container ID is required" });
      }

      // Generate a unique hash for the image name
      const container = docker.getContainer(containerId);
      
      // Commit the container to a new image
      const imageName = uuid4().replace(/-/g, '');
      await container.commit({
        repo: imageName
      });

      // Get the image reference
      const image = docker.getImage(imageName);

      // Push the image
      const stream = await image.push();
      
      // Handle the push stream
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, output) => {
          if (err) reject(err);
          resolve(output);
        });
      });

      // Return the unique hash that can be used to pull the image
      res.json({ 
        success: true, 
        imageName
      });

    } catch (error) {
      console.error('Error sharing container:', error);
      res.status(500).json({ 
        error: "Failed to share container",
        details: error.message 
      });
    }
  });

module.exports = router;
