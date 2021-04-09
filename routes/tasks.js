const express = require("express");
const { check } = require("express-validator");

const { isSignedIn } = require("../controllers/auth");
const { createTask } = require("../controllers/tasks");

const router = express.Router();

router.post(
   "/project/:projectId/stage/:stageId/task",
   [check("title", "Title is required").isLength({ min: 1 })],
   isSignedIn,
   createTask
);

module.exports = router;
