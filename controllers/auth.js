const { validationResult } = require("express-validator");

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
         return res.status(201).json({ id: user._id });
      });
   });
};
