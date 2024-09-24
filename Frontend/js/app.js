    const contactForm = document.getElementById('contactForm');
    const contactList = document.getElementById('contactList');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('search');
    const prevButton = document.getElementById('prevButton'); // New: Previous button
    const nextButton = document.getElementById('nextButton'); // New: Next button
    const pageInfo = document.getElementById('pageInfo'); // New: Page info display

    let currentPage = 1; // New: Current page tracker
    const limit = 10; // New: Limit of contacts per page
    let editingContactId = null; // Track the ID of the contact being edited

    // Function to fetch and display all contacts
    const fetchContacts = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/contacts?page=${currentPage}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch contacts');
            
            const data = await response.json();
            console.log(data); // Log the response data

            const contacts = data.contacts; // Access the contacts array from the response object

            if (!Array.isArray(contacts)) {
                throw new Error('Expected an array of contacts');
            }

            contactList.innerHTML = ''; // Clear the current list
            contacts.forEach(contact => addContactToList(contact));
            
            // Update pagination info
            updatePagination(data.totalPages); // Update total pages in the UI
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    // Update pagination information
    function updatePagination(totalPages) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevButton.disabled = currentPage === 1; // Disable previous button if on the first page
        nextButton.disabled = currentPage === totalPages; // Disable next button if on the last page
    }

    // Add contact form submission event listener
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;

        // Validate input values
        if (!name || !phone || !email) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            let response;
            if (editingContactId) {
                // Update existing contact
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

                const data = await response.json();
                const updatedContact = data.contact;
                updateContactInList(updatedContact); // Update the contact in the list
            } else {
                // Create new contact
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

                const data = await response.json();
                const newContact = data.contact; // Access the correct property
                addContactToList(newContact);
            }

            contactForm.reset();
            editingContactId = null; // Reset the editing contact ID after submission
        } catch (error) {
            console.error('Error creating/updating contact:', error);
            alert(error.message);
        }
    });

    // Function to add contact to the list
    function addContactToList(contact) {
        const li = document.createElement('li');
        li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;
        
        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';
        editButton.onclick = () => editContact(contact); // Set the edit function

        li.appendChild(editButton); // Append the Edit button to the list item
        contactList.appendChild(li);
    }

    // Function to update a contact in the list
// Function to update a contact in the list
function updateContactInList(contact) {
    // Find the list item that contains the contact's name
    const listItems = contactList.querySelectorAll('li');
    listItems.forEach(li => {
        if (li.textContent.includes(contact.name)) {
            li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;
            
            // Re-create and append the Edit button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn';
            editButton.onclick = () => editContact(contact); // Set the edit function

            li.appendChild(editButton); // Append the Edit button to the list item
        }
    });
}


    // Function to handle editing a contact
    function editContact(contact) {
        editingContactId = contact._id; // Set the ID of the contact to edit
        document.getElementById('name').value = contact.name;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('email').value = contact.email;
    }

    // Add search button event listener
    searchButton.addEventListener('click', async () => {
        const searchValue = searchInput.value;

        try {
            const response = await fetch(`http://localhost:5000/api/contacts/search?name=${searchValue}`);
            const data = await response.json();

            if (data.contacts && Array.isArray(data.contacts)) {
                contactList.innerHTML = '';

                data.contacts.forEach(contact => {
                    addContactToList(contact);
                });
            } else {
                throw new Error("Expected an array of contacts");
            }
        } catch (error) {
            console.error("Error searching contacts:", error);
        }
    });

    // Pagination Controls
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchContacts(); // Fetch contacts for the previous page
        }
    });

    nextButton.addEventListener('click', () => {
        currentPage++;
        fetchContacts(); // Fetch contacts for the next page
    });

    // Initial fetch of contacts when the page loads
    fetchContacts();
