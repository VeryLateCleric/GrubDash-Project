const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /dishes routes needed to make the tests pass

// Add route to handle ‘/dishes’ with handlers for create and list operations
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);
// Add route to handle ‘/dishes/:dishId’ with handlers for read and update operations.
router
    .route("/dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);
// Attach handlers from dishes.controller.js

module.exports = router;
