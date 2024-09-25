const contactForm = document.getElementById('contactForm');
const contactList = document.getElementById('contactList');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('search');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const pageInfo = document.getElementById('pageInfo');

let currentPage = 1;
const limit = 10;
let editingContactId = null;

// Fetch contacts
const fetchContacts = async () => {
    try {
        const response = await fetch(`http://localhost:5000/api/contacts?page=${currentPage}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch contacts');

        const data = await response.json();
        const contacts = data.contacts;

        if (!Array.isArray(contacts)) {
            throw new Error('Expected an array of contacts');
        }

        contactList.innerHTML = '';
        contacts.forEach(contact => addContactToList(contact));

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
                updateContactInList(data.contact);
            } else {
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
                addContactToList(data.contact);
            }
    
            contactForm.reset();
            editingContactId = null;
        } catch (error) {
            console.error('Error creating/updating contact:', error);
            alert(error.message);
        }
    });
}

if (searchButton) {
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
                throw new Error('Expected an array of contacts');
            }
        } catch (error) {
            console.error('Error searching contacts:', error);
        }
    });
}

function addContactToList(contact) {
    const li = document.createElement('li');
    li.textContent = `${contact.name} - ${contact.phone} - ${contact.email}`;
    
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => editContact(contact);
    
    li.appendChild(editButton);
    contactList.appendChild(li);
}

function editContact(contact) {
    editingContactId = contact._id;
    document.getElementById('name').value = contact.name;
    document.getElementById('phone').value = contact.phone;
    document.getElementById('email').value = contact.email;
}

// Pagination Controls
if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchContacts();
        }
    });

    nextButton.addEventListener('click', () => {
        currentPage++;
        fetchContacts();
    });
}

// Fetch the initial contact list if on the contact list page
if (contactList) {
    fetchContacts();
}
