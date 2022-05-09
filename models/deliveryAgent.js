const mongoose = require('mongoose');

const DeliveryAgentSchema = new mongoose.Schema({
    customername: {
        type: String,
        required: [true, 'Customername cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank']
    },
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
})

module.exports = mongoose.model('DeliveryAgent', DeliveryAgentSchema);