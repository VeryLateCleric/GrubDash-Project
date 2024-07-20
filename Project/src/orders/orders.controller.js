const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Add middleware to validate orders data. 
function confirmOrderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    // if No order found, return error
    if (!foundOrder) 
        return next({ status: 404, message: `No order with ID: ${orderID} could be found.`})
    res.locals.order = foundOrder; // else push to res.locals if we do find it
    return next
}

function confirmId(req, res, next) {
    
}
// Add a handler function to function to create an order.

// Add a handler function to read an order by ID.

// Add a handler function to update an order.

// Add a handler function to delete an order.

// Add a handler function to list all orders.


