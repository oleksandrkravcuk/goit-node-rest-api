import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import multer from "multer";
import './db/db.js'
import authRouter from "./routes/authRouter.js";
import contactsRouter from "./routes/contactsRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

export const publicPath = path.resolve("public");

app.use(express.static(publicPath));

const upload = multer({ dest: "tmp/" });

app.use("/api/users", authRouter);
app.use("/api/contacts", contactsRouter);
app.get('/avatars/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(publicPath, 'avatars', filename));
});
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});
