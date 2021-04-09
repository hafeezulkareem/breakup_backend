const { validationResult } = require("express-validator");

const Project = require("../models/project");
const Stage = require("../models/stage");
const Task = require("../models/task");

exports.createTask = (req, res) => {
   const errors = validationResult(res);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   const {
      params: { projectId, stageId },
      body: { title },
   } = req;

   Project.findById(projectId).exec((error, project) => {
      if (error) {
         return res.status(400).json({ error: "Project is not valid" });
      }
      Stage.findById(stageId).exec((error, stage) => {
         if (error) {
            return res.status(400).json({ error: "Stage is not valid" });
         }
         const task = new Task({ title, stage, project });
         task.save((error, task) => {
            if (error) {
               return res.status(400).json({ error: "Unable to add task" });
            }
            const { _id: id } = task;
            return res.status(200).json({ id });
         });
      });
   });
};
