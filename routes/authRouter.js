import express from "express";
import { register, login, logout, current } from "../controllers/authControllers.js";
import authMiddleware from "../helpers/authMiddleware.js";


const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/current", authMiddleware, current);

export default authRouter;