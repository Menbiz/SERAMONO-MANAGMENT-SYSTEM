const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

// Create New Subjects
const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        const existingSubjectBySubCode = await Subject.findOne({
            'subjects.subCode': subjects[0].subCode,
            school: req.body.adminID,
        });

        if (existingSubjectBySubCode) {
            return res.status(409).json({ message: 'Subject code must be unique and it already exists' });
        }

        const newSubjects = subjects.map((subject) => ({
            ...subject,
            sclassName: req.body.sclassName,
            school: req.body.adminID,
        }));

        const result = await Subject.insertMany(newSubjects);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get All Subjects for a Specific School
const allSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");

        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }

        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Subjects for a Specific Class
const classSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id });

        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }

        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Subjects Without Assigned Teacher
const freeSubjectList = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });

        if (subjects.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }

        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Details of a Specific Subject
const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id)
            .populate("sclassName", "sclassName")
            .populate("teacher", "name");

        if (!subject) {
            return res.status(404).json({ message: "No subject found" });
        }

        res.status(200).json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Delete a Specific Subject
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        if (!deletedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Unset teachSubject in teachers
        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        // Remove deleted subject from students' examResult and attendance
        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id }, attendance: { subName: deletedSubject._id } } }
        );

        res.status(200).json({ message: "Subject deleted successfully", deletedSubject });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete All Subjects for a Specific School
const deleteSubjects = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });

        if (deletedSubjects.deletedCount === 0) {
            return res.status(404).json({ message: "No subjects found to delete" });
        }

        // Unset teachSubject in teachers
        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" } }
        );

        // Remove all examResult and attendance records in students
        await Student.updateMany(
            {},
            { $set: { examResult: [], attendance: [] } }
        );

        res.status(200).json({ message: "Subjects deleted successfully", deletedSubjects });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete All Subjects for a Specific Class
const deleteSubjectsByClass = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });

        if (deletedSubjects.deletedCount === 0) {
            return res.status(404).json({ message: "No subjects found to delete" });
        }

        // Unset teachSubject in teachers
        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" } }
        );

        // Remove all examResult and attendance records in students
        await Student.updateMany(
            {},
            { $set: { examResult: [], attendance: [] } }
        );

        res.status(200).json({ message: "Subjects deleted successfully", deletedSubjects });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { 
    subjectCreate, 
    allSubjects, 
    classSubjects, 
    freeSubjectList, 
    getSubjectDetail, 
    deleteSubject, 
    deleteSubjects, 
    deleteSubjectsByClass 
};
