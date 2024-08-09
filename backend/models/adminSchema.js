const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['Admin', 'SuperAdmin'], // Adjust based on roles you want to support
        default: 'Admin',
    },
    schoolName: {
        type: String,
        required: [true, 'School name is required'],
        unique: true,
        trim: true,
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
    versionKey: false // Disables the version key (__v)
});

module.exports = mongoose.model('Admin', adminSchema);
