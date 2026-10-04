const Contact = require('../models/Contact');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our saree concierge team will get back to you shortly.',
      data: newContact,
    });
  } catch (error) {
    console.error('Create Contact Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact message. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Public (or Admin)
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('Get All Contacts Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact messages',
    });
  }
};

// @desc    Get contact submission by ID
// @route   GET /api/contact/:id
// @access  Public (or Admin)
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get Contact By Id Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact message',
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
};
