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

export const sendMail = async (to, subject, html) => {

    try {
        console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS)
        console.log(to, subject, html);

        if (!to || !subject || !html) {
            return console.error({ message: 'To, subject, and text are required' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);

        return console.log({ message: 'Email sent successfully' });
    }
    catch (error) {
        return console.error({ message: 'Internal server error', error: error.message });
    }
}