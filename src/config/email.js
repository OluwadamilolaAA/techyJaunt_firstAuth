const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Set up email data
    const mailOption ={
      from: process.env.EMAIL_USER, //sender address
      to, //list of receiver
      subject, // subject line
      text // plain text body

    };
    //send email with defined transport object
    await transporter.sendMail(mailOption);
    console.log('Email sent successfully!')
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

// Enhanced email function with HTML support
const sendTemplateEmail = async (to, subject, htmlContent, textContent) => {
    try {
        // Create a transporter object using SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Set up email data with HTML support
        const mailOptions = {
            from: `Car Rental Service <${process.env.EMAIL_USER}>`, // sender address with name
            to, // list of receivers
            subject, // Subject line
            text: textContent, // plain text body (fallback)
            html: htmlContent // HTML body
        };

        // Send mail with defined transport object
        await transporter.sendMail(mailOptions);
        console.log('Template email sent successfully');
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.log('Error sending template email:', error);
        return { success: false, message: error.message };
    }
}

module.exports = { sendEmail, sendTemplateEmail };
