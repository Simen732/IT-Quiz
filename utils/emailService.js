const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter with explicit Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Required for some network conditions
      tls: {
        rejectUnauthorized: false
      },
      // Debug settings
      debug: true,
      logger: true
    });

    // Define email options with plain text alternative
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text || "Reset your password by clicking the link in this email"
    };

    // Send the email with improved logging
    console.log('Attempting to send email to:', options.email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw error;
  }
};

module.exports = sendEmail;