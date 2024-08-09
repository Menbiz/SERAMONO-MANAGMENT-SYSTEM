const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true // Removes extra whitespace
    },
    rollNum: {
        type: Number,
        required: [true, 'Roll number is required'],
        unique: true // Ensures roll numbers are unique
    },
    password: {
        type: String,
        required: [true, 'Password is required']
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
    role: {
        type: String,
        default: 'Student'
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject', // Consistent with the model name
                required: [true, 'Subject reference is required']
            },
            marksObtained: {
                type: Number,
                default: 0,
                min: [0, 'Marks cannot be negative'] // Ensures non-negative values
            }
        }
    ],
    attendance: [
        {
            date: {
                type: Date,
                required: [true, 'Date is required']
            },
            status: {
                type: String,
                enum: ['Present', 'Absent'],
                required: [true, 'Status is required']
            },
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject', // Consistent with the model name
                required: [true, 'Subject reference is required']
            }
        }
    ]
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false // Removes the __v field
});

module.exports = mongoose.model('Student', studentSchema);
