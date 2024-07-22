const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// Order validation middleware
function confirmOrderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  // if No order found, return error
  if (!foundOrder)
    return next({
      status: 404,
      message: `No order with ID: ${orderId} could be found.`,
    });
  res.locals.order = foundOrder; // else push to res.locals if we do find it
  return next;
}

function hasRequiredFields(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes = [] } = {} } = req.body;

  if (Array.isArray(dishes)) {
    dishes.forEach((dish, index) => {
      if (!dish.quantity || dish.quantity < 0) {
        next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
      }
    });
  }
  // Validate order has needed properties, else error
  if (!deliverTo || !mobileNumber || !dishes || !dishes.length || !Array.isArray(dishes)
  ) {
    let missingProperty = !deliverTo ? "deliverTo" : !mobileNumber ? "mobileNumber" : "dishes";
    return next({
      status: 400,
      message: `Order must include a ${missingProperty} property`,
    });
  }

  if (!Array.isArray(dishes)) {
    return next({
      status: 400,
      message: "Order must include array of at least one dish",
    });
  }
}

// Update Validation Middleware
function updateValidation(req, res, next) {
  const { data } = req.body;
  const { orderId } = req.params;
  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered",
  ];

  if (data.id && data.id !== orderId) {
    return next({
      status: 400,
      message: `Order ID: ${data.id} does not match with route ID: ${orderId}`,
    });
  }

  if (data.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  if (validStatuses.includes(data.status)) {
    data.id = orderId;
    res.locals.update = data;
    return next();
  } else {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, or delivered",
    });
  }
}

// Add Delete validation for pending status here


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~CRUD OPERATIONS~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Add a handler function to list all orders.
function list(req, res, next) {
  res.json({ data: orders })
}

// Add a handler function to function to create an order.
function create(req, res, next) {
  res.locals.create.id = nextId()
  orders.push(res.locals.create)
  res.status(201).json({ data : res.locals})
}

// Add a handler function to read an order by ID.
function read(req, res, next) {
  res.json({ data: res.locals.order})
}

// Add a handler function to update an order.
function update(req, res, next) {
  res.json({ data : res.locals.update})
}

// Add a handler function to delete an order.
function destroy(req, res, next) {
  orders.splice(res.locals.index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [hasRequiredFields, create],
  read: [confirmOrderExists, read],
  update: [confirmOrderExists, hasRequiredFields, updateValidation, update],
  delete: [confirmOrderExists, destroy]
};
