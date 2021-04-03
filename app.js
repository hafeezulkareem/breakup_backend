require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

mongoose
   .connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
   })
   .then(() => {
      console.log("DB CONNECTED");
   })
   .catch((err) => {
      console.log("DB CONNECTION ERROR", err);
   });

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 3001;

app.listen(port, () => {
   console.log(`App running on port ${port}`);
});
