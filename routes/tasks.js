const express = require("express");
const { check } = require("express-validator");

const { isSignedIn } = require("../controllers/auth");
const { createTask, updateOrder, deleteTask } = require("../controllers/tasks");

const router = express.Router();

router.post(
   "/stage/:id/task",
   [check("title", "Title is required").isLength({ min: 1 })],
   isSignedIn,
   createTask
);

router.put(
   "/task/:id/order/update",
   [check("order", "Order is not valid").isNumeric()],
   isSignedIn,
   updateOrder
);

router.delete("/stage/:stageId/task/:taskId/delete", isSignedIn, deleteTask);

module.exports = router;
