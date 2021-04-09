const mongoose = require("mongoose");

const stageSchema = mongoose.Schema(
   {
      name: { type: String, maxlength: 250, trim: true, required: true },
      project: { type: mongoose.Schema.ObjectId, ref: "Project" },
      tasks: { type: Array, default: [] },
   },
   { timestamp: true }
);

module.exports = mongoose.model("Stage", stageSchema);
