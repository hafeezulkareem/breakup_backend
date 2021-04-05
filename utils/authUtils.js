const jwt = require("jsonwebtoken");

exports.getUserDetailsFromToken = (req) => {
   const userToken = req.headers.authorization;
   const token = userToken.split(" ");
   const userDetails = jwt.verify(token[1], process.env.SECRET);
   return userDetails;
};
