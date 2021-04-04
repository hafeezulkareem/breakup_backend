const { validationResult } = require("express-validator");

const User = require("../models/user");
const Project = require("../models/project");

exports.createProject = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0] });
   }

   const { userId, title } = req.body;
   User.findById(userId).exec((error, user) => {
      if (error || !user) {
         return res.status(400).json({ error: "User is not valid" });
      }

      const project = new Project({ title, admin: user });
      project.save((error, project) => {
         if (error) {
            return res.status(400).json({ error: "Unable to create project" });
         }
         const { _id } = project;
         User.findOneAndUpdate(
            { _id: userId },
            { $push: { projects: _id } },
            { useFindAndModify: false },
            (error, projects) => {
               if (error) {
                  return res
                     .status(400)
                     .json({ error: "Unable to create project" });
               }
            }
         );
         return res.status(200).json({ projectId: _id });
      });
   });
};
