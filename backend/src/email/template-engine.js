const { getTemplate, listTemplates } = require("./templates/registry");
const { textFromHtml } = require("./utils/sanitize");

const renderEmail = (type, data = {}) => {
  const template = getTemplate(type);
  if (!template) {
    throw new Error(`Unknown email template: ${type}`);
  }

  const rendered = template(data);
  return {
    type,
    subject: rendered.subject,
    html: rendered.html,
    text: textFromHtml(rendered.html),
  };
};

module.exports = {
  listTemplates,
  renderEmail,
};
