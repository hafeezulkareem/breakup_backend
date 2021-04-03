const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const { signup } = require("../controllers/auth");

router.post(
   "/signup",
   [
      check("name", "Name should be at least 3 characters").isLength({
         min: 3,
      }),
      check("email", "A valid email is required").isEmail(),
      check("password", "Password should be at least 3 characters").isLength({
         min: 3,
      }),
   ],
   signup
);

module.exports = router;
