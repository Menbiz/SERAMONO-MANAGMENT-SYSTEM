const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Consistent with the model name
        required: [true, 'User reference is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now // Automatically sets the current date if not provided
    },
    complaint: {
        type: String,
        required: [true, 'Complaint text is required'],
        trim: true, // Removes extra whitespace
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

module.exports = mongoose.model('Complain', complainSchema);
