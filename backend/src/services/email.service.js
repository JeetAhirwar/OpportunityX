const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

const getTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    throw new Error("SMTP is not configured");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return transporter;
};

exports.sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  await getTransporter().sendMail({
    from: env.emailFrom,
    to: email,
    subject: "Reset your OpportunityX password",
    text: `Hello ${name},\n\nReset your OpportunityX password using this link:\n${resetUrl}\n\nThis link expires in one hour. If you did not request this, ignore this email.`,
    html: `<p>Hello ${name},</p><p>Reset your OpportunityX password using the link below:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour. If you did not request this, ignore this email.</p>`,
  });
};
