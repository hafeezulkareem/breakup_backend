const mongoose = require("mongoose");

const stageSchema = mongoose.Schema(
   {
      name: { type: String, maxlength: 250, trim: true, required: true },
      tasks: [{ type: mongoose.Schema.ObjectId, ref: "Task" }],
   },
   { timestamp: true }
);

module.exports = mongoose.model("Stage", stageSchema);
