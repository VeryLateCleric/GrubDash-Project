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
  return next();
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
  } else {
    res.locals.newOrder = req.body.data
    next()
  }
}

// Update Validation Middleware
function validateDishes(req, res, next) {
  const { dishes } = res.locals.newOrder;
  // dishes must be an array that is not empty
  if (!dishes || !Array.isArray(dishes) || !dishes.length)
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });

  // Each dish in dishes needs to have a quantity and it must be a positive integer
  dishes.forEach(({ quantity }, index) => {
    if (!quantity || quantity < 0 || !Number.isInteger(quantity))
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
  });

  return next();
}

function updateValidation(req, res, next) {
  const { data } = req.body;
  const { orderId } = req.params;
  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];

  if (data.id && data.id !== orderId) {
    return next({
      status: 400,
      message: `Order id: ${data.id} does not match with route ID: ${orderId}`,
    });
  } else if (data.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else if (validStatuses.includes(data.status)) {
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
function deleteValidation(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: "Orders cannot be deleted unless thay have 'pending' status"
    })
  }
  next();
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~CRUD OPERATIONS~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Add a handler function to list all orders.
function list(req, res, next) {
  res.json({ data: orders })
}

// Add a handler function to function to create an order.
function create(req, res) {
  res.locals.newOrder = { ...res.locals.newOrder, id: nextId() };
  orders.push(res.locals.newOrder);
  res.status(201).json({ data: res.locals.newOrder });
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
  const index = orders.indexOf(res.locals.foundOrder)
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [hasRequiredFields, validateDishes, create],
  read: [confirmOrderExists, read],
  update: [confirmOrderExists, hasRequiredFields, validateDishes, updateValidation, update],
  delete: [confirmOrderExists, deleteValidation, destroy]
};
