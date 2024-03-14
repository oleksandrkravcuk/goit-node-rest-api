import mongoose from "mongoose";

const contactsScheme = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
},
{
    versionKey: false
},    
)

const Contact = mongoose.model("Contact", contactsScheme);



export default Contact;