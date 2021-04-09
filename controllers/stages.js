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

      const stage = new Stage({ name, project });
      stage.save((error, stage) => {
         if (error) {
            res.status(400).json({ error: "Unable to create stage" });
         }
         project.updateOne(
            { _id: id },
            { $push: { stages: stage } },
            { useFindAndModify: true },
            (error, stages) => {
               if (error) {
                  return res
                     .status(400)
                     .json({ error: "Unable to create stage" });
               }
            }
         );
      });
      const { _id } = stage;
      return res.status(200).json({ id: _id });
   });
};
