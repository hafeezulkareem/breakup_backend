const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
   {
      title: {
         type: String,
         trim: true,
      },
      assignee: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
      },
   },
   { timestamp: true }
);

module.exports = mongoose.model("Task", taskSchema);
