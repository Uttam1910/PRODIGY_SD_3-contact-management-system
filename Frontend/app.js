const contactList = document.getElementById('contactList');

// Fetch and display contacts
async function fetchContacts() {
  const response = await fetch('http://localhost:3000/contacts');
  const contacts = await response.json();
  
  contactList.innerHTML = '';
  contacts.forEach(contact => {
    const li = document.createElement('li');
    li.innerHTML = `${contact.name} - ${contact.phone} - ${contact.email}
      <button onclick="deleteContact('${contact._id}')">Delete</button>`;
    contactList.appendChild(li);
  });
}

fetchContacts();
