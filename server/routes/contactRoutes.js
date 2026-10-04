const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
} = require('../controllers/contactController');

// Routes
router.post('/', createContact);
router.get('/', getAllContacts);
router.get('/:id', getContactById);

module.exports = router;
