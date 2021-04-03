const mongoose = require("mongoose");
const crypto = require("crypto");
const uuid = require("uuid/v1");

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
      projects: {
         type: Array,
         default: [],
      },
   },
   { timestamp: true }
);

userSchema
   .virtual("password")
   .set((password) => {
      this._password = password;
      this.salt = uuid();
      this.encryptedPassword = this.securePassword(password);
   })
   .get(() => {
      return this._password;
   });

userSchema.methods = {
   authenticate: (plainPassword) => {
      return this.securePassword(plainPassword) === this.encryptedPassword;
   },
   securePassword: (plainPassword) => {
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
