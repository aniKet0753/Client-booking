const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const ContactContent = require('../models/ContactContent');

const transporter = nodemailer.createTransport({
    // Example for using Gmail as the mail service
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS, // Your app password from .env
    },
});

// 5. Define the API endpoint for sending email
router.post('/', async (req, res) => {
    // Destructure data from the request body
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const { name, email, phone, address, message } = req.body;

    let content = await ContactContent.findById('mainContactDoc');

    // Basic validation to ensure all required fields are present
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required fields.' });
    }

    // Email content configuration
    console.log(`${content.email}`);
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: `${content.email}`, // Replace with your desired recipient email
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #0D2044;">Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Address:</strong> ${address || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <p style="border: 1px solid #ccc; padding: 15px; border-radius: 8px;">${message}</p>
            </div>
        `,
    };

    try {
        // Send the email using the transporter
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        // Handle any errors that occur during the sending process
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send message.', error: error.message });
    }
});

module.exports = router;