const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true // Removes extra whitespace
    },
    details: {
        type: String,
        required: [true, 'Details are required'],
        trim: true // Removes extra whitespace
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now // Automatically sets the current date if not provided
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Consistent with the model name
        required: [true, 'School reference is required']
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false // Removes the __v field
});

module.exports = mongoose.model('Notice', noticeSchema);
