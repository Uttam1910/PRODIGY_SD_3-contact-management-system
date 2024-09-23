// controllers/contactController.js

const Contact = require('../models/ContactModel');

// Add a new contact
exports.createContact = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const newContact = new Contact({ name, phone, email });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
};

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

// Get a single contact
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
};

// Update a contact
exports.updateContact = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(req.params.id, { name, phone, email }, { new: true });
    if (!updatedContact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact', error: error.message });
  }
};

// Delete a contact
exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
};
