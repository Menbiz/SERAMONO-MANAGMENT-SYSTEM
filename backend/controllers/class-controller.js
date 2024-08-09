const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

// Create a New Class
const sclassCreate = async (req, res) => {
    try {
        const { sclassName, adminID } = req.body;

        // Check if the class name already exists for the school
        const existingSclassByName = await Sclass.findOne({
            sclassName,
            school: adminID
        });

        if (existingSclassByName) {
            return res.status(400).json({ message: 'Sorry, this class name already exists' });
        }

        // Create and save the new class
        const sclass = new Sclass({
            sclassName,
            school: adminID
        });

        const result = await sclass.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// List All Classes for a School
const sclassList = async (req, res) => {
    try {
        const sclasses = await Sclass.find({ school: req.params.id });

        if (sclasses.length > 0) {
            res.status(200).json(sclasses);
        } else {
            res.status(404).json({ message: "No classes found" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Details of a Specific Class
const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id).populate("school", "schoolName");

        if (!sclass) {
            return res.status(404).json({ message: "No class found" });
        }

        res.status(200).json(sclass);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Students in a Specific Class
const getSclassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        const modifiedStudents = students.map((student) => {
            return { ...student._doc, password: undefined };
        });

        res.status(200).json(modifiedStudents);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Delete a Specific Class
const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);

        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        await Student.deleteMany({ sclassName: req.params.id });
        await Subject.deleteMany({ sclassName: req.params.id });
        await Teacher.deleteMany({ teachSclass: req.params.id });

        res.status(200).json(deletedClass);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Delete All Classes for a Specific School
const deleteSclasses = async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ school: req.params.id });

        if (deletedClasses.deletedCount === 0) {
            return res.status(404).json({ message: "No classes found to delete" });
        }

        await Student.deleteMany({ school: req.params.id });
        await Subject.deleteMany({ school: req.params.id });
        await Teacher.deleteMany({ school: req.params.id });

        res.status(200).json(deletedClasses);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
    sclassCreate,
    sclassList,
    deleteSclass,
    deleteSclasses,
    getSclassDetail,
    getSclassStudents
};
