const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const { createProject, getProjects } = require("../controllers/projects");
const { isSignedIn } = require("../controllers/auth");

router.post(
   "/project",
   [check("title", "Title is required").isLength({ min: 1 })],
   isSignedIn,
   createProject
);

router.get("/projects", isSignedIn, getProjects);

module.exports = router;
