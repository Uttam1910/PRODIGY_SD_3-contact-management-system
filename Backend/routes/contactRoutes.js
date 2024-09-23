const express = require('express');
const { createContact, getContacts, getContactById, updateContact, deleteContact, searchContacts, softDeleteContact } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validateContact');
const router = express.Router();

// Route for creating a contact
router.post('/', validateContact, createContact);

// Route for searching contacts by name or email
router.get('/search', searchContacts);

// Route for getting all contacts with pagination
router.get('/', getContacts);

// Route for getting a contact by ID
router.get('/:id', getContactById);

// Route for updating a contact
router.put('/:id', validateContact, updateContact);

// Route for soft-deleting a contact
router.patch('/soft-delete/:id', softDeleteContact);

// Route for hard deleting a contact
router.delete('/:id', deleteContact);

module.exports = router;
