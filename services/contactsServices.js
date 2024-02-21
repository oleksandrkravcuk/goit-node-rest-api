import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contactsPath = path.join(__dirname, "../db/contacts.json");

async function listContacts() {
  try {
    const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
    return JSON.parse(data);
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts();
    const contactsById = contacts.find((contact) => contact.id === contactId);
    return contactsById || null;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

async function removeContact(contactId) {
  try {
    const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
    const contacts = JSON.parse(data);
    const removedContact = contacts.find((contact) => contact.id === contactId);
    const updatedContacts = contacts.filter(
        (contacts) => contacts.id !== contactId
    );

    if (!updatedContacts) {
        return null;
    }

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

    return removedContact;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

async function addContact(name, email, phone) {
  try {
    const contacts = await listContacts();

    const existingContact = contacts.find(
        (contact) => contact.email === email || contact.phone === phone
    );

    const newContact = {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
    };

    if (existingContact) {
        return null;
    }

    const updatedContacts = [...contacts, newContact];

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts), {
        encoding: "utf-8",
    });

    return newContact;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

async function updContact(contactId, body) {
  try {
    const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
    const contacts = JSON.parse(data);
    const index = contacts.findIndex((contact) => contact.id === contactId);
    if (index === -1) {
        return null;
    }
    contacts[index] = { ...contacts[index], ...body };

    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return contacts[index];
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export { listContacts, getContactById, removeContact, addContact, updContact };