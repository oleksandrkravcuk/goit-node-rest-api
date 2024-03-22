import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import jimp from "jimp";
import nodemailer from 'nodemailer';
import { nanoid } from "nanoid";

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
    },
});


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
        let token = nanoid();
        const createUser = await User.create({
            name, email: nEmail, password: hashPassword, verificationToken: token,
            subscription: 'starter',
        });
        
        if (!createUser.verificationToken) {
            createUser.verificationToken = token;
            await createUser.save();
        }
        
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Email Verification',
            text: `Click the link to verify your email: ${process.env.BASE_URL}/users/verify/${token}`,
            html: `<p style="color: brown; text-align: center; font-size: 32px;">Click the link to verify your email: <a href="${process.env.BASE_URL}/users/verify/${token}" style="font-size: 32px">Verify</a> `,
        };
        
        await transporter.sendMail(mailOptions);
        res.status(201).json({
            user: {
                email,
                subscription: createUser.subscription,
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
        
        res.status(200).json({ token });
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
        const { email, subscription, avatarURL } = req.user;
        res.status(200).json({ user: { email, subscription, avatarURL } });
    } catch (error) {
        next(error);
    }
};


export const updateAvatar = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const publicPath = path.resolve("public");
        if (!req.file) {
            return res.status(400).json({ message: 'Avatar file is required' });
        }
        const avatar = await jimp.read(req.file.path);
        await avatar.cover(250, 250).writeAsync(req.file.path);
        const avatarName = `${userId}${path.extname(req.file.originalname)}`;
        const avatarURL = `/avatars/${avatarName}`;
        await fs.promises.rename(req.file.path, path.join(publicPath, 'avatars', avatarName));
        await User.findByIdAndUpdate(userId, { avatarURL });
        const updatedUser = await User.findByIdAndUpdate(userId, { avatarURL }, { new: true });

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        next(error);
    }
};

export const verificationToken = async (req, res, next) => {
    const { verificationToken } = req.params;
    try {
        const user = await User.findOneAndUpdate({ verificationToken }, { verify: true, verificationToken: null });
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }
      user.verify = true;
      await user.save();
      return res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
      next(error);
    }
  };
  

  export const verificationTokenRepeat = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Missing required field email' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verify) {
            return res.status(400).json({ message: 'Verification has already been passed' });
        }

        const verificationToken = nanoid();
        user.verificationToken = verificationToken;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Email Verification',
            text: `Click the link to verify your email: ${process.env.BASE_URL}/users/verify/${verificationToken}`,
            html: `<p style="color: brown; text-align: center; font-size: 32px;">Click the link to verify your email: <a href="${process.env.BASE_URL}/users/verify/${verificationToken}" style="font-size: 32px">Verify</a> `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Verification email sent' });
            }
        });
    } catch (error) {
        next(error);
    }
};