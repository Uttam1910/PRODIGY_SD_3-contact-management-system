const Contact = require("../models/ContactModel");

// Add a new contact with duplicate check
exports.createContact = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    // Check if a contact with the same phone or email already exists
    const existingContact = await Contact.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingContact) {
      return res.status(400).json({
        message: "Contact with the same phone or email already exists",
      });
    }

    // Create a new contact if no duplicate is found
    const newContact = new Contact({ name, phone, email });
    await newContact.save();
    res.status(201).json({
      message: "Contact created successfully",
      contact: newContact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating contact", error: error.message });
  }
};

// Get all contacts with pagination and exclude soft-deleted ones
exports.getContacts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const contacts = await Contact.find({ deleted: false })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      message: "Contacts fetched successfully",
      contacts: contacts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching contacts", error: error.message });
  }
};

// Get a single contact
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact || contact.deleted)
      return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({
      message: "Contact fetched successfully",
      contact: contact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching contact", error: error.message });
  }
};

// Update a contact
exports.updateContact = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true }
    );
    if (!updatedContact || updatedContact.deleted)
      return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({
      message: "Contact updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating contact", error: error.message });
  }
};

// Delete a contact (soft delete)
exports.softDeleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact || contact.deleted)
      return res.status(404).json({ message: "Contact not found" });

    contact.deleted = true; // Set deleted flag
    await contact.save();
    res.status(200).json({ message: "Contact marked as deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting contact", error: error.message });
  }
};

// Hard delete a contact
exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact)
      return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting contact", error: error.message });
  }
};

// Search contacts by name or email.
exports.searchContacts = async (req, res) => {
  const { name, email } = req.query;

  try {
    const query = {
      $or: [],
    };

    if (name) {
      query.$or.push({ name: { $regex: name, $options: "i" } });
    }

    if (email) {
      query.$or.push({ email: { $regex: email, $options: "i" } });
    }

    const contacts = await Contact.find(query);

    if (contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }

    res.status(200).json({
      message: "Contacts found successfully",
      contacts: contacts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching contacts", error: error.message });
  }
};

// Route to get soft-deleted contacts (recycle bin)
exports.getRecycleBin = async (req, res) => {
  console.log("Received request for recycle bin");
  try {
    console.log("Fetching deleted contacts...");
    const deletedContacts = await Contact.find({ deleted: true });
    console.log("Deleted Contacts: ", deletedContacts);
    
    res.status(200).json({
      message: 'Deleted contacts fetched successfully',
      contacts: deletedContacts,
    });
  } catch (error) {
    console.error("Error fetching deleted contacts: ", error);
    res.status(500).json({
      message: 'Error fetching deleted contacts',
      error: error.message,
    });
  }
};



// Restore a soft-deleted contact
exports.restoreContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    if (!contact.deleted)
      return res.status(400).json({ message: "Contact is not deleted" });

    // Restore the contact
    contact.deleted = false;
    await contact.save();

    res.status(200).json({ message: "Contact restored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error restoring contact", error: error.message });
  }
};
