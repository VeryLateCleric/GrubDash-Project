const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /orders routes needed to make the tests pass

// Add route to handle ‘/orders’ with handlers for create and list operations.
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

// Add route to handle ‘/orders/:orderId’ with handlers for read, update, and delete operations.
router
  .route("/orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.destroy)
  .all(methodNotAllowed);

// Attach handlers from ‘orders.controller.js’

module.exports = router;
