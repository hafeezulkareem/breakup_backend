const { validationResult } = require("express-validator");

const User = require("../models/user");
const Project = require("../models/project");
const { getUserDetailsFromToken } = require("../utils/authUtils");
const { MEMBER } = require("../constants/roles");

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

      const project = new Project({ title, description, members: [user] });
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
      .populate("members")
      .populate({ path: "stages", populate: { path: "tasks" } })
      .exec((error, project) => {
         if (error || !project) {
            return res.status(400).json({ error: "Project not found" });
         }
         const {
            _id: projectId,
            title,
            description,
            members,
            stages,
         } = project;
         const projectStages = stages.map((stage) => {
            const { _id: stageId, name, tasks } = stage;
            const stageTasks = [];
            tasks.forEach((task) => {
               const { _id: taskId, title } = task;
               stageTasks.push({ id: taskId, title });
            });
            return { id: stageId, name, tasks: stageTasks };
         });
         const projectMembers = members.map((member) => {
            const { _id: memberId, role } = member;
            return { id: memberId, role };
         });
         return res.status(200).json({
            id: projectId,
            title,
            description,
            stages: projectStages,
            members: projectMembers,
         });
      });
};

exports.addUser = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0] });
   }

   const {
      params: { id },
   } = req;

   const { email } = req.body;
   User.findOne({ email }).exec((error, user) => {
      if (error || !user) {
         return res.status(400).json({ error: "User not found" });
      }
      Project.findById(id).exec((error, project) => {
         if (error || !project) {
            return res.status(400).json({ error: "Project not found" });
         }

         const { members } = project;
         const { email } = user;
         const member = members.find((member) => member.user === email);
         if (member) {
            return res
               .status(400)
               .json({ error: "User is already added to the project" });
         }

         project.updateOne(
            { $push: { members: { user, role: MEMBER } } },
            { useFindAndModify: false },
            (error, members) => {
               if (error) {
                  return res
                     .status(400)
                     .json({ error: "Unable to add member to the project" });
               }
               const { _id } = project;
               user.updateOne(
                  { $push: { projects: { _id } } },
                  { useFindAndModify: false },
                  (error, projects) => {
                     if (error) {
                        return res.status(400).json({
                           error: "Unable to add member to the project",
                        });
                     }
                     return res.status(200).json({});
                  }
               );
            }
         );
      });
   });
};

exports.updateDescription = async (req, res) => {
   const {
      params: { id },
      body: { description },
   } = req;

   try {
      const project = await Project.findById(id);
      await project.updateOne({ description });
      return res.status(200).json();
   } catch (error) {
      return res
         .status(400)
         .json({ error: "Unable to update project description" });
   }
};
