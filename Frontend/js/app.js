const contactForm = document.getElementById('contactForm');
const contactList = document.getElementById('contactList');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('search');

// Function to fetch and display all contacts
const fetchContacts = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        
        const data = await response.json();
        console.log(data); // Log the response data

        // Access the contacts array from the response object
        const contacts = data.contacts; // Change this line

        if (!Array.isArray(contacts)) {
            throw new Error('Expected an array of contacts');
        }

        contactList.innerHTML = ''; // Clear the current list
        contacts.forEach(contact => addContactToList(contact));
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
};


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
        const response = await fetch('http://localhost:5000/api/contacts', {
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
        contactForm.reset();
    } catch (error) {
        console.error('Error creating contact:', error);
        alert(error.message);
    }
});

function addContactToList(contact) {
    const li = document.createElement('li');
    li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;
    contactList.appendChild(li);
}



// Add search button event listener
searchButton.addEventListener('click', async () => {
    const searchValue = searchInput.value;

    try {
        // Make a GET request to search for contacts
        const response = await fetch(`http://localhost:5000/api/contacts/search?name=${searchValue}`);
        const data = await response.json();

        // Check if the response contains the contacts array
        if (data.contacts && Array.isArray(data.contacts)) {
            // Clear the current list
            contactList.innerHTML = '';

            // Loop through each contact and add them to the list
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


// Function to add contact to the list
function addContactToList(contact) {
    const li = document.createElement('li');
    li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;
    contactList.appendChild(li);
}

// Initial fetch of contacts when the page loads
fetchContacts();
