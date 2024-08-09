const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

// Register a New Teacher
const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({
            name,
            email,
            password: hashedPass,
            role,
            school,
            teachSubject,
            teachSclass
        });

        const result = await teacher.save();
        await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });

        result.password = undefined; // Remove password from the response
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Teacher Log In
const teacherLogIn = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.body.email });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const validated = await bcrypt.compare(req.body.password, teacher.password);
        if (!validated) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const populatedTeacher = await teacher
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
            .execPopulate();

        populatedTeacher.password = undefined; // Remove password from the response
        res.status(200).json(populatedTeacher);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get All Teachers for a Specific School
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");

        if (teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found" });
        }

        const modifiedTeachers = teachers.map((teacher) => {
            teacher.password = undefined; // Remove password from the response
            return teacher;
        });

        res.status(200).json(modifiedTeachers);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get Details of a Specific Teacher
const getTeacherDetail = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName");

        if (!teacher) {
            return res.status(404).json({ message: "No teacher found" });
        }

        teacher.password = undefined; // Remove password from the response
        res.status(200).json(teacher);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Update a Teacher's Subject
const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });
        res.status(200).json(updatedTeacher);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete a Specific Teacher
const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!deletedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.status(200).json({ message: "Teacher deleted successfully", deletedTeacher });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete All Teachers for a Specific School
const deleteTeachers = async (req, res) => {
    try {
        const deletedTeachers = await Teacher.find({ school: req.params.id });
        const deletedCount = deletedTeachers.length;

        if (deletedCount === 0) {
            return res.status(404).json({ message: "No teachers found to delete" });
        }

        await Teacher.deleteMany({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" } }
        );

        res.status(200).json({ message: "Teachers deleted successfully", deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete All Teachers for a Specific Class
const deleteTeachersByClass = async (req, res) => {
    try {
        const deletedTeachers = await Teacher.find({ teachSclass: req.params.id });
        const deletedCount = deletedTeachers.length;

        if (deletedCount === 0) {
            return res.status(404).json({ message: "No teachers found to delete" });
        }

        await Teacher.deleteMany({ teachSclass: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" } }
        );

        res.status(200).json({ message: "Teachers deleted successfully", deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update Teacher's Attendance
const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) => a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};
