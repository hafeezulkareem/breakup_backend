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

exports.updateOrder = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   const {
      params: { id: taskId },
      body: { source_id: sourceId, destination_id: destinationId, order },
   } = req;

   Stage.findById(sourceId)
      .populate("tasks")
      .exec(async (error, stage) => {
         if (error || !stage) {
            return res.status(400).json({ error: "Stage not found" });
         }

         const { tasks } = stage;

         const task = tasks.find((task) => task._id == taskId);
         if (!task) {
            return res.status(400).json({ error: "Task not found" });
         }
         const updatedTasks = tasks.filter((task) => task._id != taskId);
         await stage.updateOne({ $set: { tasks: updatedTasks } });

         Stage.findById(destinationId).exec((error, destinationStage) => {
            if (error || !destinationStage) {
               return res
                  .status(400)
                  .json({ error: "Destination stage not found" });
            }

            const { tasks } = destinationStage;
            if (order > tasks.length) {
               return res.status(400).json({ error: "Order is not valid" });
            }

            tasks.splice(order, 0, task);

            destinationStage.updateOne({ $set: { tasks } }, (error, tasks) => {
               if (error) {
                  return res.status(400).json({
                     error: "Unable to update the order of tasks",
                  });
               }
               return res.status(200).json({});
            });
         });
      });
};

exports.deleteTask = async (req, res) => {
   const {
      params: { stageId, taskId },
   } = req;

   try {
      const stage = await Stage.findById(stageId).populate("tasks");
      const { tasks } = stage;
      const updatedTasks = tasks.filter((task) => task._id != taskId);
      await stage.updateOne(
         { $set: { tasks: updatedTasks } },
         { useFindAndModify: false }
      );
      const task = await Task.findById(taskId);
      await task.deleteOne();
      return res.status(200).json();
   } catch (error) {
      return res.status(400).json({ error: "Unable to delete task" });
   }
};
