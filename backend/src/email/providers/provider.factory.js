const env = require("../../config/env");
const { EMAIL_PROVIDER } = require("../email.constants");
const NodemailerProvider = require("./nodemailer.provider");

const unsupportedProvider = (provider) => ({
  isConfigured: () => false,
  async send() {
    throw new Error(`Email provider "${provider}" is not implemented yet`);
  },
});

const createProvider = () => {
  const provider = String(env.email.provider || EMAIL_PROVIDER.NODEMAILER).toLowerCase();

  if (provider === EMAIL_PROVIDER.NODEMAILER) {
    return new NodemailerProvider({
      smtp: env.smtp,
      from: env.email.from,
    });
  }

  return unsupportedProvider(provider);
};

module.exports = {
  createProvider,
};
