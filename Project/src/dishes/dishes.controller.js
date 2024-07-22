const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Add middleware to validate dish data.
function hasRequiredFields(req, res, next) {
    const {data : {name, description, price, image_url} = {}} = req.body;

    if (!name || !description || !price || !(typeof price === 'number') || price < 0 || !image_url) {
        let missingProperty = !name ? "name" : !description ? "description" : !price ? "price" : (!(typeof price === 'number') || price < 0)? "price that is an integer greater than 0" : "image_url"
        next({
            status: 400,
            message: `Dish must include a ${missingProperty}`
        })
    }
}

function confirmDishExists(req, res, next) {

}

// Update Validation Middleware
function updateValidation(req, res, next) {
    
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~CRUD OPERATIONS~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// Add handler function to list all dishes.
function list(req, res) {
    res.json({ data : dishes });
}

// Add handler function to create a dish
function create(req, res) {
    dishes.push(res.locals.dish)
    res.locals.newDish
}
// Add handler function to read a dish by ID
function read(req, res) {
    res.locals.dish
}

// Add handler function to update a dish
function update(req, res, next) {
    res.status(200).json({ data : res.locals.dish })
}

module.exports = {
    list,
    read: [confirmDishExists, read],
    create: [hasRequiredFields, create],
    update: [confirmDishExists, hasRequiredFields, updateValidation, update],
}