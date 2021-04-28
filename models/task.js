const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
   {
      title: {
         type: String,
         trim: true,
      },
      description: {
         type: String,
         trim: true,
         default: "",
      },
      assignee: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
      },
   },
   { timestamp: true }
);

module.exports = mongoose.model("Task", taskSchema);
