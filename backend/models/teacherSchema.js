const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Teacher name is required'],
        trim: true // Removes extra whitespace
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
        lowercase: true, // Converts email to lowercase
        trim: true // Removes extra whitespace
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['Teacher', 'Admin'], // Restricts to specific roles
        default: 'Teacher'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Consistent with model name
        required: [true, 'School reference is required'],
    },
    teachSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject' // Consistent with model name
    },
    teachSclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SClass', // Consistent with model name
        required: [true, 'Class reference is required'],
    },
    attendance: [{
        date: {
            type: Date,
            required: [true, 'Date is required']
        },
        presentCount: {
            type: Number, // Changed to Number for count values
            default: 0
        },
        absentCount: {
            type: Number, // Changed to Number for count values
            default: 0
        }
    }]
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false // Removes __v field
});

module.exports = mongoose.model('Teacher', teacherSchema);
