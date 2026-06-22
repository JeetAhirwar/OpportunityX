const RecruiterNote = require("../models/recruiter-note.model");

exports.saveNote = async (req, res) => {
  try {
    const { candidateId, jobId, content } = req.body;
    const note = await RecruiterNote.findOneAndUpdate(
      { recruiter: req.user._id, candidate: candidateId, job: jobId },
      { content },
      { new: true, upsert: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await RecruiterNote.findOne({
      recruiter: req.user._id,
      candidate: req.params.candidateId,
      job: req.params.jobId,
    });
    res.json(note || { content: "" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

