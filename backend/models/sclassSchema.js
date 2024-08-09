const mongoose = require('mongoose');

const sclassSchema = new mongoose.Schema({
    sclassName: {
        type: String,
        required: [true, 'Class name is required'],
        trim: true // Removes extra whitespace
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

module.exports = mongoose.model('SClass', sclassSchema);
