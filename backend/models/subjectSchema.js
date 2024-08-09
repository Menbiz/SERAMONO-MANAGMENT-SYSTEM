const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subName: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true // Removes extra whitespace
    },
    subCode: {
        type: String,
        required: [true, 'Subject code is required'],
        unique: true // Ensures subject codes are unique
    },
    sessions: {
        type: String,
        required: [true, 'Sessions information is required'],
        trim: true // Removes extra whitespace
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SClass', // Consistent with the model name
        required: [true, 'Class reference is required']
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Consistent with the model name
        required: [true, 'School reference is required']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher' // Consistent with the model name
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false // Removes the __v field
});

module.exports = mongoose.model('Subject', subjectSchema);
