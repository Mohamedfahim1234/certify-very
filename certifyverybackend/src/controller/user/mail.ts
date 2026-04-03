import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
    if (!to || !subject || !html) {
        throw new Error('To, subject, and html are required');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error: any) {
        console.error('Error sending email:', error.message);
        throw error; // Rethrow to allow caller to handle
    }
}