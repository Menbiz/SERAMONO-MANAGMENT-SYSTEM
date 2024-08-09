const Notice = require('../models/noticeSchema.js');

// Create a New Notice
const noticeCreate = async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            school: req.body.adminID
        });
        const result = await notice.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// List All Notices for a Specific School
const noticeList = async (req, res) => {
    try {
        const notices = await Notice.find({ school: req.params.id });

        if (notices.length === 0) {
            return res.status(404).json({ message: "No notices found" });
        }

        res.status(200).json(notices);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Update a Specific Notice
const updateNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Notice not found" });
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Delete a Specific Notice
const deleteNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Notice not found" });
        }

        res.status(200).json({ message: "Notice deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Delete All Notices for a Specific School
const deleteNotices = async (req, res) => {
    try {
        const result = await Notice.deleteMany({ school: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No notices found to delete" });
        }

        res.status(200).json({ message: "Notices deleted successfully", result });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
    noticeCreate,
    noticeList,
    updateNotice,
    deleteNotice,
    deleteNotices
};
