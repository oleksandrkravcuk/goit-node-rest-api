import HttpError from "../helpers/HttpError.js";
import validateBody from "../helpers/validateBody.js";
import {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updContact,
} from "../services/contactsServices.js";

import {
    createContactSchema,
    updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await listContacts();
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await getContactById(id);
        if (!contact) {
        throw HttpError(404, "Not found");
        }
        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const delContact = await removeContact(id);
        if (!delContact) {
        throw HttpError(404, "Not found");
        }
        res.status(200).json(delContact);
    } catch (error) {
    next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        validateBody(createContactSchema)(req, res, async () => {
        const contact = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        };

        if ((!contact.name, !contact.email, !contact.phone)) {
            return res
            .status(400)
            .json({ message: "All fields (name, email, phone) are required" });
        }

        const newContact = await addContact(
            contact.name,
            contact.email,
            contact.phone
        );

        if (!newContact) {
            throw HttpError(409, "Contact already exists");
        }

        res.status(201).json(newContact);
    });
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { error } = updateContactSchema.validate(req.body);
        if (error) {
        throw HttpError(400, error.message);
        }
        const { id } = req.params;
        const updatedContact = await updContact(id, req.body);
        if (!updatedContact) {
        throw HttpError(404, "Not found");
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};
