const emailService = require("../services/email.service");

exports.listEmailTemplates = (_req, res) => {
  res.json({
    success: true,
    data: emailService.listTemplates(),
  });
};

exports.previewEmailTemplate = (req, res) => {
  const preview = emailService.preview(req.params.type, req.body || {});
  res.json({
    success: true,
    data: preview,
  });
};

exports.validateEmailTemplates = (_req, res) => {
  res.json({
    success: true,
    data: emailService.validateTemplates(),
  });
};
