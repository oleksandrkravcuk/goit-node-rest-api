import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const dbURL = process.env.dbURL

mongoose.connect(dbURL).then(()=> console.log('Database connection successful')).catch((error) => { console.log(error.message)
    process.exit(1);
})