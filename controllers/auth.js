const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

const User = require("../models/user");

exports.signup = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   User.findOne({ email: req.body.email }).exec((error, user) => {
      if (user) {
         return res
            .status(400)
            .json({ error: "Account with given email is already exists" });
      }

      const newUser = new User(req.body);
      newUser.save((error, user) => {
         if (error) {
            return res
               .status(400)
               .json({ error: "Unable to create account. Try again!" });
         }
         return res.status(201).json({});
      });
   });
};

exports.signin = (req, res) => {
   const errors = validationResult(req.body);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   const { email, password } = req.body;
   User.findOne({ email }).exec((error, user) => {
      if (error || !user) {
         return res
            .status(400)
            .json({ error: "User doesn't exists with the email" });
      }

      if (!user.authenticate(password)) {
         return res
            .status(401)
            .json({ error: "Email and password doesn't match" });
      }

      const token = jwt.sign({ _id: user._id }, process.env.SECRET);
      res.cookie("token", token, { expire: new Date() + 604800 });

      const { _id, email, name } = user;
      return res.status(200).json({ token, id: _id, name });
   });
};

exports.signout = (req, res) => {
   res.clearCookie("token");
   return res.status(200).json({
      message: "User signed out successfully",
   });
};

exports.isSignedIn = expressJwt({
   secret: process.env.SECRET,
   userProperty: "auth",
   algorithms: ["sha1", "RS256", "HS256"],
});

exports.isAuthenticated = (req, res, next) => {
   const isAuthenticated =
      req.profile && req.auth && req.profile._id == req.auth._id;
   if (!isAuthenticated) {
      return res.status(403).json({ error: "Access denied" });
   }
   next();
};
