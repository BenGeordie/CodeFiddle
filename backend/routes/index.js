const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const Docker = require('dockerode');

const uuid4 = require("uuid4");
const directoryTree = require("directory-tree");

// Initialize Docker with auth config
const docker = new Docker({
  authconfig: {
    username: process.env.DOCKER_USERNAME,
    password: process.env.DOCKER_PASSWORD,
    serveraddress: 'https://index.docker.io/v1/' // DockerHub registry URL
  }
});

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
      console.log("Sharing container");
      const { containerId } = req.body;
      if (!containerId) {
        return res.status(400).json({ error: "Container ID is required" });
      }
      
      const imageName = uuid4().replace(/-/g, '');
      const container = docker.getContainer(containerId);
      
      console.log("Committing container");
      // Commit with repository name including Docker Hub username
      await container.commit({
        repo: `${process.env.DOCKER_USERNAME}/playground`,
        tag: imageName
      });

      const image = docker.getImage(`${process.env.DOCKER_USERNAME}/playground:${imageName}`);
      
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
      
      console.log("Done");
      res.json({ 
        success: true, 
        imageName: `${process.env.DOCKER_USERNAME}/playground:${imageName}`
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
