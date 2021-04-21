const { validationResult } = require("express-validator");

const Stage = require("../models/stage");
const Task = require("../models/task");

exports.createTask = (req, res) => {
   const errors = validationResult(res);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   const {
      params: { id },
      body: { title },
   } = req;

   Stage.findById(id).exec((error, stage) => {
      if (error || !stage) {
         return res.status(400).json({ error: "Stage is not valid" });
      }
      const task = new Task({ title });
      task.save(async (error, task) => {
         if (error) {
            return res.status(400).json({ error: "Unable to add task" });
         }
         await stage.updateOne({ $push: { tasks: task } });
         const { _id: id } = task;
         return res.status(200).json({ id });
      });
   });
};
