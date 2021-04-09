const express = require("express");
const { check } = require("express-validator");

const { isSignedIn } = require("../controllers/auth");
const { createStage } = require("../controllers/stages");

const router = express.Router();

router.post("/project/:id/stage", [
   check("name", "Name is required").isLength({ min: 3 }),
   isSignedIn,
   createStage,
]);

module.exports = router;
