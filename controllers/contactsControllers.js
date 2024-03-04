import {
    createContactSchema,
    updateContactSchema,
    favoriteSchema,
  } from "../schemas/contactsSchemas.js";
  import HttpError from "../helpers/HttpError.js";
  import validateBody from "../helpers/validateBody.js";
  
  import Contact from "../models/contacts.js";
  
  export const getAllContacts = async (req, res, next) => {
    try {
      const contacts = await Contact.find();
      res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  };
  
  export const getOneContact = async (req, res, next) => {
    try {
      const contactId = req.params.id;
      const contact = await Contact.findById(contactId);
  
      if (contact) {
        res.status(200).json(contact);
      } else {
        res.status(404).json({ message: "Not Found" });
      }
    } catch (error) {
      next(error);
    }
  };
  
  export const deleteContact = async (req, res, next) => {
    try {
      const contactId = req.params.id;
      const deletedContact = await Contact.findByIdAndDelete(contactId);
  
      if (deletedContact) {
        res.status(200).json(deletedContact);
      } else {
        res.status(404).json({ message: "Not Found" });
      }
    } catch (error) {
      next(error);
    }
  };
  
  export const createContact = async (req, res, next) => {
    try {
      validateBody(createContactSchema)(req, res, async () => {
        const { error, value } = createContactSchema.validate(req.body);
        if (error) {
          return next(HttpError(400, error.message));
        }
        const { name, email, phone } = value;
        const newContact = await Contact.create({ name, email, phone });
        res.status(201).json(newContact);
      });
    } catch (error) {
      next(error);
    }
  };
  
  export const updateContact = async (req, res, next) => {
    try {
      validateBody(updateContactSchema)(req, res, async () => {
        const { error, value } = updateContactSchema.validate(req.body);
        if (error) {
          return next(HttpError(400, error.message));
        }
        const contactId = req.params.id;
        const updatedContact = await Contact.findByIdAndUpdate(contactId, value, {
          new: true,
        });
        if (!updatedContact) {
          return next(HttpError(404, "Not Found"));
        }
        res.status(200).json(updatedContact);
      });
    } catch (error) {
      next(error);
    }
  };
  
  
  export const updateStatusContact = async (req, res, next) => {
    try {
      validateBody(favoriteSchema)(req, res, async () => {
        const { error, value } = favoriteSchema.validate(req.body);
        if (error) {
          return next(HttpError(400, error.message));
        }
        const { favorite } = value;
        const { id } = req.params;
  
        const updatedContact = await Contact.findByIdAndUpdate(
          id,
          { favorite },
          { new: true }
        );
  
        if (!updatedContact) {
          return res.status(404).json({ message: "Not Found" });
        }
  
        res.status(200).json(updatedContact);
      });
    } catch (error) {
      next(error);
    }
  };
