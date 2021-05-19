const express = require("express");
const { check } = require("express-validator");

const { isSignedIn } = require("../controllers/auth");
const {
   createTask,
   updateOrder,
   deleteTask,
   updateDescription,
   assignMember,
} = require("../controllers/tasks");

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

router.put("/task/:id/description/update", isSignedIn, updateDescription);

router.delete("/stage/:stageId/task/:taskId/delete", isSignedIn, deleteTask);

router.put(
   "/task/:id/assign/member",
   [check("email", "Email is not valid").isEmail()],
   isSignedIn,
   assignMember
);

module.exports = router;
