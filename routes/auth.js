const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const { signUp, signIn, signOut, isSignedIn } = require("../controllers/auth");

router.post(
   "/signUp",
   [
      check("name", "Name should be at least 3 characters").isLength({
         min: 3,
      }),
      check("email", "A valid email is required").isEmail(),
      check("password", "Password should be at least 3 characters").isLength({
         min: 3,
      }),
   ],
   signUp
);

router.post(
   "/signIn",
   [
      check("email", "A valid is required").isEmail(),
      check("password", "Password is required").isLength({ min: 1 }),
   ],
   signIn
);

router.get("/signOut", signOut);

module.exports = router;
