// routes/contacts.js

const express = require('express');
const { createContact, getContacts, getContactById, updateContact, deleteContact } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validateContact');
const router = express.Router();

// Route for creating a contact
router.post('/', validateContact, createContact);

// Route for getting all contacts
router.get('/', getContacts);

// Route for getting a contact by ID
router.get('/:id', getContactById);

// Route for updating a contact
router.put('/:id', validateContact, updateContact);

// Route for deleting a contact
router.delete('/:id', deleteContact);

module.exports = router;
