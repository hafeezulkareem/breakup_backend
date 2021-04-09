const { validationResult } = require("express-validator");

const User = require("../models/user");
const Project = require("../models/project");
const Stage = require("../models/stage");
const { getUserDetailsFromToken } = require("../utils/authUtils");

exports.createProject = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0] });
   }

   const { title, description } = req.body;
   const { _id: userId } = getUserDetailsFromToken(req);
   User.findById(userId).exec((error, user) => {
      if (error || !user) {
         return res.status(400).json({ error: "User is not valid" });
      }

      const project = new Project({ title, description, admin: user });
      project.save((error, project) => {
         if (error) {
            return res.status(400).json({ error: "Unable to create project" });
         }
         User.findOneAndUpdate(
            { _id: userId },
            { $push: { projects: project } },
            { useFindAndModify: false },
            (error, projects) => {
               if (error) {
                  return res
                     .status(400)
                     .json({ error: "Unable to create project" });
               }
            }
         );
         const { _id } = project;
         return res.status(200).json({ id: _id });
      });
   });
};

exports.getProjects = (req, res) => {
   const { _id: userId } = getUserDetailsFromToken(req);
   User.findById(userId)
      .populate({ path: "projects" })
      .exec((error, user) => {
         if (error) {
            return res.status(400).json({ error: "Unable to get projects" });
         }
         const { projects } = user;
         const userProjects = [];
         projects.forEach((project) => {
            const { _id: id, title, description } = project;
            userProjects.push({
               id,
               title,
               description: description ? description : "",
            });
         });
         return res.status(200).json(userProjects);
      });
};

exports.getProjectDetails = (req, res) => {
   const {
      params: { id },
   } = req;

   Project.findById(id)
      .populate("admin")
      .exec((error, project) => {
         if (error || !project) {
            return res.status(400).json({ error: "Project not found" });
         }
         Stage.find({ project: id }).exec((error, stages) => {
            if (error) {
               res.status(400).json({ error: "Unable to get project details" });
            }
            const {
               _id: id,
               title,
               description,
               admin: { _id: adminId, name },
            } = project;
            const projectStages = stages.map((stage) => {
               const { _id: id, tasks, name } = stage;
               return { id, name, tasks };
            });
            return res.status(200).json({
               id,
               title,
               description,
               admin_id: adminId,
               admin_name: name,
               stages: projectStages,
            });
         });
      });
};
