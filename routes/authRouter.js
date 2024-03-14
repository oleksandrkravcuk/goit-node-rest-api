import express from "express";
import { register, login, logout, current, updateAvatar } from "../controllers/authControllers.js";
import authMiddleware from "../helpers/authMiddleware.js";
import multer from "multer";
import path from "path";

const upload = multer({ dest: "tmp/" });

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/current", authMiddleware, current);
authRouter.patch("/avatars", authMiddleware, upload.single("avatar"), (req, res, next) => {
    updateAvatar(req, res, next, path.resolve("public"));
});

export default authRouter;