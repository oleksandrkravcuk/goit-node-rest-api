import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const nEmail = email.toLowerCase(); 

    try {
        const user = await User.findOne({ email: nEmail });
        if(user) {
            return res.status(409).json({ message: 'Email in use' });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const createUser = await User.create({
            name, email: nEmail, password: hashPassword,
        });
        res.status(201).json({
            user: {
                email,
                subscription: createUser.subscription
            }
        });
    } catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const nEmail = email.toLowerCase();
    
    try {
        const user = await User.findOne({ email: nEmail });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }
        const token = jwt.sign({
            id: user._id,
            name: user.name
        }, process.env.JWT_SECRET);
        
        await User.findByIdAndUpdate(user._id, { token });
        
        res.status(200).json({ token,
        user: {
        email: user.email,
        subscription: user.subscription,
            } 
    });
    } catch (error) {
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ message: "Not authorized" });
        }
        user.token = null;
        await user.save();
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
export const current = async (req, res, next) => {
    try {
        const { email, subscription } = req.user;
        res.status(200).json({ user: { email, subscription } });
    } catch (error) {
        next(error);
    }
};