const { validationResult } = require("express-validator");

const User = require("../models/user");
const Project = require("../models/project");
const Stage = require("../models/stage");
const Task = require("../models/task");
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
      params: { id: projectId },
   } = req;

   Project.findById(projectId)
      .populate("admin")
      .exec((error, project) => {
         if (error || !project) {
            return res.status(400).json({ error: "Project not found" });
         }
         Stage.find({ project: projectId }).exec((error, stages) => {
            if (error) {
               res.status(400).json({ error: "Unable to get project details" });
            }
            const {
               _id: projectId,
               title,
               description,
               admin: { _id: adminId, name },
            } = project;
            const projectStages = stages.map(async (stage) => {
               const { _id: stageId, name } = stage;
               const stageTasks = [];
               const tasks = await Task.find(
                  { project: projectId, stage: stageId },
                  (error, tasks) => {
                     if (error) {
                        return res
                           .status(400)
                           .json({ error: "Unable to get project details" });
                     }
                  }
               );
               tasks.forEach((task) => {
                  const { _id: taskId, title } = task;
                  stageTasks.push({ id: taskId, title });
               });
               return { id: stageId, name, tasks: stageTasks };
            });
            Promise.all(projectStages).then((stages) => {
               return res.status(200).json({
                  id: projectId,
                  title,
                  description,
                  admin_id: adminId,
                  admin_name: name,
                  stages,
               });
            });
         });
      });
};
