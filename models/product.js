const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({

    productname: {
        type: String,
        required: [true, 'ProductName cannot be blank']
    },
    producttype: {
        type: String,
        required: [true, 'ProductType cannot be blank']
    },
    location: {
        type: String,
        required: [true, 'Location cannot be blank']
    },
    date: {
        type: String,
    }
})

module.exports = mongoose.model('Product', ProductSchema);