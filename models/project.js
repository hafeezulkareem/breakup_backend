const mongoose = require("mongoose");

const { ADMIN } = require("../constants/roles");

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
      stages: [{ type: mongoose.Schema.ObjectId, ref: "Stage" }],
      members: [
         {
            user: { type: mongoose.Schema.ObjectId, ref: "User" },
            role: { type: String, default: ADMIN },
         },
      ],
   },
   { timestamp: true }
);

module.exports = mongoose.model("Project", projectSchema);
