document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const contactList = document.getElementById('contactList');
    const recycleBinList = document.getElementById('recycleBinList');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('search');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const pageInfo = document.getElementById('pageInfo');
    const viewRecycleBinButton = document.getElementById('viewRecycleBin');

    // Check if elements exist
    if (!contactList || !recycleBinList || !searchButton || !prevButton || !nextButton || !pageInfo || !viewRecycleBinButton) {
        console.error('One or more required DOM elements are missing.');
        return; // Exit the function if any element is not found
    }

    let currentPage = 1;
    const limit = 10;
    let editingContactId = null;
    let inRecycleBin = false;

    // Fetch contacts
    const fetchContacts = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/contacts?page=${currentPage}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch contacts');

            const data = await response.json();
            const contacts = data.contacts;

            contactList.innerHTML = '';
            contacts.forEach(contact => {
                if (!contact.deleted) {
                    addContactToList(contact);
                }
            });

            updatePagination(data.totalPages);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    function updatePagination(totalPages) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    // Add contact to list
    function addContactToList(contact) {
        const li = document.createElement('li');
        li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editContact(contact);

        const softDeleteButton = document.createElement('button');
        softDeleteButton.textContent = 'Soft Delete';
        softDeleteButton.onclick = () => softDeleteContact(contact._id);

        li.appendChild(editButton);
        li.appendChild(softDeleteButton);
        contactList.appendChild(li);
    }

    // Soft delete contact
    const softDeleteContact = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/contacts/${id}`, {
                method: 'PUT' // Changed to PUT to mark as deleted
            });
            if (!response.ok) {
                throw new Error('Failed to soft delete contact');
            }
            fetchContacts(); // Refresh contact list after soft delete
            alert('Contact moved to recycle bin');
        } catch (error) {
            console.error('Error soft deleting contact:', error);
            alert(error.message);
        }
    };

    // Hard delete contact
    const hardDeleteContact = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/contacts/${id}/harddelete`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to hard delete contact');
            }
            fetchContacts(); // Refresh contact list after hard delete
            fetchRecycleBinContacts(); // Refresh recycle bin list
            alert('Contact deleted permanently');
        } catch (error) {
            console.error('Error hard deleting contact:', error);
            alert(error.message);
        }
    };

    // Fetch recycle bin contacts
    const fetchRecycleBinContacts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/contacts/recyclebin');
            if (!response.ok) throw new Error('Failed to fetch recycle bin contacts');

            const data = await response.json();
            const contacts = data.contacts;

            recycleBinList.innerHTML = '';
            contacts.forEach(contact => {
                if (contact.deleted) { // Only show deleted contacts in the recycle bin
                    addRecycleBinContactToList(contact);
                }
            });
        } catch (error) {
            console.error('Error fetching recycle bin contacts:', error);
        }
    };

    // Add recycle bin contact to list
    function addRecycleBinContactToList(contact) {
        const li = document.createElement('li');
        li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;

        const restoreButton = document.createElement('button');
        restoreButton.textContent = 'Restore';
        restoreButton.onclick = () => restoreContact(contact._id);

        const hardDeleteButton = document.createElement('button');
        hardDeleteButton.textContent = 'Delete Permanently';
        hardDeleteButton.onclick = () => hardDeleteContact(contact._id);

        li.appendChild(restoreButton);
        li.appendChild(hardDeleteButton);
        recycleBinList.appendChild(li);
    }

    // Restore contact from recycle bin
    const restoreContact = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/contacts/restore/${id}`, {
                method: 'PUT' // Ensure you have this endpoint set up correctly
            });
            if (!response.ok) {
                throw new Error('Failed to restore contact');
            }
            fetchContacts(); // Refresh contact list after restore
            fetchRecycleBinContacts(); // Refresh recycle bin list after restore
            alert('Contact restored successfully');
        } catch (error) {
            console.error('Error restoring contact:', error);
            alert(error.message);
        }
    };

    // Edit contact functionality
    function editContact(contact) {
        editingContactId = contact._id;
        document.getElementById('name').value = contact.name;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('email').value = contact.email;
    }

    // Form submit event (for adding or editing contact)
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;

            if (!name || !phone || !email) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                let response;
                if (editingContactId) {
                    // Update contact
                    response = await fetch(`http://localhost:5000/api/contacts/${editingContactId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, phone, email })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update contact');
                    }

                    alert('Contact updated successfully!');
                    fetchContacts(); // Refresh contact list after update
                } else {
                    // Add new contact
                    response = await fetch('http://localhost:5000/api/contacts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, phone, email })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to create contact');
                    }

                    alert('Contact added successfully!');
                    fetchContacts(); // Refresh contact list after new contact
                }

                contactForm.reset();
                editingContactId = null; // Reset editing ID
            } catch (error) {
                console.error('Error creating/updating contact:', error);
                alert(error.message);
            }
        });
    }

    // Search contact
    if (searchButton) {
        searchButton.addEventListener('click', async () => {
            const searchValue = searchInput.value;

            try {
                const response = await fetch(`http://localhost:5000/api/contacts/search?name=${searchValue}`);
                const data = await response.json();

                if (data.contacts && Array.isArray(data.contacts)) {
                    contactList.innerHTML = '';
                    data.contacts.forEach(contact => {
                        if (!contact.deleted) { // Only show non-deleted contacts
                            addContactToList(contact);
                        }
                    });
                }
            } catch (error) {
                console.error('Error searching contacts:', error);
            }
        });
    }

    // Pagination controls
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchContacts();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentPage++;
            fetchContacts();
        });
    }

    // Toggle recycle bin view
    if (viewRecycleBinButton) {
        viewRecycleBinButton.addEventListener('click', () => {
            inRecycleBin = !inRecycleBin;
            contactList.style.display = inRecycleBin ? 'none' : 'block';
            recycleBinList.style.display = inRecycleBin ? 'block' : 'none';
            if (inRecycleBin) {
                fetchRecycleBinContacts(); // Fetch recycle bin contacts
            } else {
                fetchContacts(); // Fetch main contacts
            }
            viewRecycleBinButton.textContent = inRecycleBin ? 'View Contacts' : 'View Recycle Bin';
        });
    }

    fetchContacts(); // Initial fetch of contacts
});
