const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");

const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         maxlength: 32,
         trim: true,
      },
      email: {
         type: String,
         required: true,
         trim: true,
         unique: true,
      },
      encryptedPassword: {
         type: String,
         required: true,
      },
      salt: String,
      projects: [{ type: mongoose.Schema.ObjectId, ref: "Project" }],
   },
   { timestamp: true }
);

userSchema
   .virtual("password")
   .set(function (password) {
      this._password = password;
      this.salt = uuid();
      this.encryptedPassword = this.securePassword(password);
   })
   .get(function () {
      return this._password;
   });

userSchema.methods = {
   authenticate: function (plainPassword) {
      return this.securePassword(plainPassword) === this.encryptedPassword;
   },
   securePassword: function (plainPassword) {
      if (!plainPassword) {
         return;
      }

      try {
         return crypto
            .createHmac("sha256", this.salt)
            .update(plainPassword)
            .digest("hex");
      } catch (error) {
         return error;
      }
   },
};

module.exports = mongoose.model("User", userSchema);
