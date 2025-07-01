const Contact = require('../models/Contact');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const nodemailer = require('nodemailer');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = asyncHandler(async (req, res, next) => {
    const contact = await Contact.create(req.body);

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `New Contact Form Submission from ${req.body.name}`,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${req.body.name}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Message:</strong></p>
            <p>${req.body.message}</p>
        `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, data: contact });
});

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (Admin)
exports.getContacts = asyncHandler(async (req, res, next) => {
    const contacts = await Contact.find().sort('-createdAt');
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
}); 