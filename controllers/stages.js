const { validationResult } = require("express-validator");

const Project = require("../models/project");
const Stage = require("../models/stage");

exports.createStage = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   const {
      params: { id },
      body: { name },
   } = req;

   Project.findById(id).exec((error, project) => {
      if (error || !project) {
         return res.status(400).json({ error: "Project doesn't exists" });
      }

      const stage = new Stage({ name });
      stage.save(async (error, stage) => {
         if (error) {
            res.status(400).json({ error: "Unable to create stage" });
         }
         await project.updateOne({ $push: { stages: stage } });
         const { _id } = stage;
         return res.status(200).json({ id: _id });
      });
   });
};

exports.updateOrder = (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array()[0].msg });
   }

   const {
      params: { projectId, stageId },
      body: { order },
   } = req;

   Project.findById(projectId)
      .populate("stages")
      .exec((error, project) => {
         if (error || !project) {
            return res.status(400).json({ error: "Project not found" });
         }

         const { stages } = project;

         if (order >= stages.length) {
            return res.status(400).json({ error: "Order is not valid" });
         }
         const stage = stages.find((stage) => stage._id == stageId);
         if (!stage) {
            return res.status(400).json({ error: "Stage not found" });
         }
         const updatedStages = stages.filter((stage) => stage._id != stageId);
         updatedStages.splice(order, 0, stage);
         project.updateOne(
            { $set: { stages: updatedStages } },
            (error, stages) => {
               if (error) {
                  return res
                     .status(400)
                     .json({ error: "Unable to update the order of stage" });
               }
               return res.status(200).json({});
            }
         );
      });
};

exports.deleteStage = async (req, res) => {
   const {
      params: { projectId, stageId },
   } = req;

   try {
      const project = await Project.findById(projectId).populate("stages");
      const { stages } = project;
      const updatedStages = stages.filter((stage) => stage._id != stageId);
      await project.updateOne(
         { $set: { stages: updatedStages } },
         { useFindAndModify: false }
      );
      const stage = await Stage.findById(stageId);
      await stage.deleteOne();
      return res.status(200).json();
   } catch (error) {
      return res.status(400).json({ error: "Unable to delete stage" });
   }
};

exports.updateName = async (req, res) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0] });
   }

   const {
      params: { id },
      body: { name },
   } = req;

   try {
      const stage = await Stage.findById(id);
      await stage.updateOne({ name });
      return res.status(200).json();
   } catch (error) {
      return res.status(400).json({ error: "Unable to update stage name" });
   }
};
