const express = require("express");
const { check } = require("express-validator");

const { isSignedIn } = require("../controllers/auth");
const { createStage, updateOrder } = require("../controllers/stages");

const router = express.Router();

router.post(
   "/project/:id/stage",
   [check("name", "Name is required").isLength({ min: 3 })],
   isSignedIn,
   createStage
);

router.put("/project/:projectId/stage/:stageId/order/update", [
   check("order", "Order should be valid").isNumeric(),
   isSignedIn,
   updateOrder,
]);

module.exports = router;
