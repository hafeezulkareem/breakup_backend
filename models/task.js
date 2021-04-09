const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
   {
      title: {
         type: String,
         trim: true,
      },
      stage: { type: mongoose.Schema.ObjectId, ref: "Stage" },
      project: { type: mongoose.Schema.ObjectId, ref: "Project" },
   },
   { timestamp: true }
);

module.exports = mongoose.model("Task", taskSchema);
