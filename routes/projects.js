const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const {
   createProject,
   getProjects,
   getProjectDetails,
   addUser,
   updateDescription,
} = require("../controllers/projects");
const { isSignedIn } = require("../controllers/auth");

router.post(
   "/project",
   [check("title", "Title is required").isLength({ min: 1 })],
   isSignedIn,
   createProject
);

router.get("/projects", isSignedIn, getProjects);

router.get("/project/:id", isSignedIn, getProjectDetails);

router.post("/project/:id/member/add", isSignedIn, addUser);

router.put("/project/:id/description/update", isSignedIn, updateDescription);

module.exports = router;
