const pipelineService = require("../services/pipeline.service");

const emitPipelineUpdate = (req, event, payload = {}) => {
  const io = req.app.get("io");
  if (!io) return;
  const recruiterId = String(payload.recruiterId || req.user._id);
  io.to(recruiterId).emit(event, payload);
  io.to(recruiterId).emit("pipeline_updated", payload);
};

const handle = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

exports.listPipeline = async (req, res) => {
  try {
    const data = await pipelineService.listPipeline({ user: req.user, query: req.query });
    res.json({ success: true, data });
  } catch (error) {
    handle(res, error);
  }
};

exports.getApplicationDetails = async (req, res) => {
  try {
    const data = await pipelineService.getApplicationDetails({ user: req.user, applicationId: req.params.id });
    res.json({ success: true, data });
  } catch (error) {
    handle(res, error);
  }
};

exports.moveApplication = async (req, res) => {
  try {
    const result = await pipelineService.moveApplication({
      user: req.user,
      applicationId: req.params.id,
      stage: req.body.stage,
      reason: req.body.reason,
    });
    emitPipelineUpdate(req, "pipeline_stage_changed", {
      applicationId: req.params.id,
      stage: req.body.stage,
      recruiterId: result.owned.job.postedBy,
    });
    res.json({ success: true, data: result.application });
  } catch (error) {
    handle(res, error);
  }
};

exports.setTags = async (req, res) => {
  try {
    const application = await pipelineService.setTags({ user: req.user, applicationId: req.params.id, tags: req.body.tags || [] });
    emitPipelineUpdate(req, "pipeline_tags_updated", { applicationId: req.params.id, tags: application.tags });
    res.json({ success: true, data: application });
  } catch (error) {
    handle(res, error);
  }
};

exports.addNote = async (req, res) => {
  try {
    const note = await pipelineService.addNote({
      user: req.user,
      applicationId: req.params.id,
      content: req.body.content,
      mentions: req.body.mentions || [],
    });
    emitPipelineUpdate(req, "pipeline_note_added", { applicationId: req.params.id, note });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    handle(res, error);
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await pipelineService.updateNote({ user: req.user, noteId: req.params.noteId, content: req.body.content });
    emitPipelineUpdate(req, "pipeline_note_updated", { noteId: req.params.noteId, note });
    res.json({ success: true, data: note });
  } catch (error) {
    handle(res, error);
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await pipelineService.deleteNote({ user: req.user, noteId: req.params.noteId });
    emitPipelineUpdate(req, "pipeline_note_deleted", { noteId: req.params.noteId });
    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    handle(res, error);
  }
};

exports.bulkAction = async (req, res) => {
  try {
    const action = req.body.action;
    const targetStage = action === "reject" ? "rejected" : action === "shortlist" ? "shortlisted" : req.body.stage;
    if (!["move", "reject", "shortlist"].includes(action)) {
      return res.status(400).json({ success: false, message: "Unsupported bulk action" });
    }
    const result = await pipelineService.bulkMove({ user: req.user, applicationIds: req.body.applicationIds, stage: targetStage });
    emitPipelineUpdate(req, "pipeline_bulk_updated", { action, stage: targetStage, applicationIds: req.body.applicationIds || [] });
    res.json({ success: true, data: result });
  } catch (error) {
    handle(res, error);
  }
};

exports.analytics = async (req, res) => {
  try {
    const data = await pipelineService.analytics({ user: req.user, jobId: req.query.jobId });
    res.json({ success: true, data });
  } catch (error) {
    handle(res, error);
  }
};
