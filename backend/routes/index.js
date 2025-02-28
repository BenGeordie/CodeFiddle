const express = require("express");
const router = express.Router();

const path = require("path");
const Docker = require('dockerode');

const directoryTree = require("directory-tree");
const resolveProjectPath = require("../utils/resolveProject");
const resolveEnvironment = require("../utils/resolveEnvironment");
const shareEnvironment = require("../utils/shareEnvironment");

// Initialize Docker with auth config
const docker = new Docker({
  authconfig: {
    username: process.env.DOCKER_USERNAME,
    password: process.env.DOCKER_PASSWORD,
    serveraddress: 'https://index.docker.io/v1/' // DockerHub registry URL
  }
});

router
  .get("/tree/:projectPath", (req, res) => {
    const projectPath = path.resolve(
      req.params.projectPath
    );
    const tree = directoryTree(projectPath);
    res.json(tree);
  })
  .post("/share", async (req, res) => {
    try {
      console.log("Sharing container");
      const { projectPath, containerId } = req.body;
      if (!containerId) {
        return res.status(400).json({ error: "Container ID is required" });
      }
      const gitUrl = await shareEnvironment(projectPath, containerId);
      
      console.log("Done");
      res.json({ 
        success: true, 
        gitUrl
      });

    } catch (error) {
      console.error('Error sharing container:', error);
      res.status(500).json({ 
        error: "Failed to share container",
        details: error.message 
      });
    }
  })
  .post("/resolve-project", async (req, res) => {
    try {
      const { projectPathOrLink } = req.body;
      const projectPath = await resolveProjectPath(projectPathOrLink);
      const environment = await resolveEnvironment(projectPath);
      res.json({ projectPath, environment });
    } catch (error) {
      console.error('Error resolving project:', error);
      res.status(500).json({ 
        error: "Failed to resolve project",
        details: error.message 
      });
    }
  });

module.exports = router;
