const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
   {
      title: {
         type: String,
         maxlength: 256,
         trim: true,
         required: true,
      },
      description: {
         type: String,
         maxlength: 500,
         trim: true,
      },
      admin: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
      },
   },
   { timestamp: true }
);

module.exports = mongoose.model("Project", projectSchema);
