const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

// Admin Registration
const adminRegister = async (req, res) => {
    try {
        const { email, schoolName, password, ...otherDetails } = req.body;

        // Check for existing email or school name
        const existingAdminByEmail = await Admin.findOne({ email });
        const existingSchool = await Admin.findOne({ schoolName });

        if (existingAdminByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        if (existingSchool) {
            return res.status(400).json({ message: 'School name already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const admin = new Admin({
            ...otherDetails,
            email,
            schoolName,
            password: hashedPassword
        });

        const result = await admin.save();
        result.password = undefined; // Remove password from the response
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Admin Login
const adminLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        admin.password = undefined; // Remove password from the response
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Admin Details
const getAdminDetail = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'No admin found' });
        }

        admin.password = undefined; // Remove password from the response
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail };
