const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

// Register a New Student
const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            return res.status(409).json({ message: 'Roll Number already exists' });
        }

        const student = new Student({
            ...req.body,
            school: req.body.adminID,
            password: hashedPass
        });

        let result = await student.save();
        result.password = undefined;

        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Student Login
const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const validated = await bcrypt.compare(req.body.password, student.password);
        if (!validated) {
            return res.status(401).json({ message: "Invalid password" });
        }

        student = await student.populate("school", "schoolName")
                              .populate("sclassName", "sclassName");
        student.password = undefined;
        student.examResult = undefined;
        student.attendance = undefined;

        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// List All Students for a Specific School
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        const modifiedStudents = students.map(student => ({
            ...student._doc,
            password: undefined
        }));

        res.status(200).json(modifiedStudents);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Details of a Specific Student
const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");

        if (!student) {
            return res.status(404).json({ message: "No student found" });
        }

        student.password = undefined;
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Update a Student's Information
const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        let result = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }

        result.password = undefined;
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete a Specific Student
const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete All Students for a Specific School
const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found to delete" });
        }

        res.status(200).json({ message: "Students deleted successfully", result });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete All Students for a Specific Class
const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found to delete" });
        }

        res.status(200).json({ message: "Students deleted successfully", result });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update Exam Result for a Specific Student
const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            result => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Record Attendance for a Specific Student
const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            a => a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            const attendedSessions = student.attendance.filter(
                a => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.status(400).json({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });
        }

        const result = await student.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Clear Attendance for All Students in a Specific Subject
const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Clear All Attendance for All Students in a Specific School
const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id;

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Remove Attendance for a Specific Student in a Specific Subject
const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName } } }
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Remove All Attendance for a Specific Student
const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};
