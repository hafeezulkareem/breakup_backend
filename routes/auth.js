const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const { signup, signin, signout } = require("../controllers/auth");

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

router.post(
   "/signin",
   [
      check("email", "A valid is required").isEmail(),
      check("password", "Password is required").isLength({ min: 1 }),
   ],
   signin
);

router.get("/signout", signout);

module.exports = router;
