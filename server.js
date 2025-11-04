import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import messagesRouter from "./routes/messagingRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());
app.use("/api/messages", messagesRouter);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("MONGODB_URI is not set in .env file");
    process.exit(1);
}

const client = new MongoClient(MONGO_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

connectDB();

process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    await client.close();
    process.exit(0);
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (message) => {
        try {
            const database = client.db("safeHaven");
            const messages = database.collection("messages");
            const savedMessage = { ...message, timestamp: new Date().toISOString(), reactions: [], pinned: false };
            await messages.insertOne(savedMessage);
            io.emit("receiveMessage", savedMessage);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on("reactToMessage", async ({ messageId, reaction }) => {
        try {
            const database = client.db("safeHaven");
            const messages = database.collection("messages");
            await messages.updateOne(
                { _id: messageId },
                { $addToSet: { reactions: reaction } }
            );
            io.emit("messageUpdated", { messageId, reaction });
        } catch (error) {
            console.error("Error adding reaction:", error);
        }
    });

    socket.on("pinMessage", async (messageId) => {
        try {
            const database = client.db("safeHaven");
            const messages = database.collection("messages");
            await messages.updateOne(
                { _id: messageId },
                { $set: { pinned: true } }
            );
            io.emit("messagePinned", messageId);
        } catch (error) {
            console.error("Error pinning message:", error);
        }
    });

    socket.on("unpinMessage", async (messageId) => {
        try {
            const database = client.db("safeHaven");
            const messages = database.collection("messages");
            await messages.updateOne(
                { _id: messageId },
                { $set: { pinned: false } }
            );
            io.emit("messageUnpinned", messageId);
        } catch (error) {
            console.error("Error unpinning message:", error);
        }
    });

    socket.on("deleteMessage", async (messageId) => {
        try {
            const database = client.db("safeHaven");
            const messages = database.collection("messages");
            await messages.deleteOne({ _id: messageId });
            io.emit("messageDeleted", messageId);
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    });

    socket.on("readMessage", async (messageId) => {
        try {
            const database = client.db("safeHaven");
            const messages = database.collection("messages");
            await messages.updateOne(
                { _id: messageId },
                { $set: { read: true } }
            );
            io.emit("messageRead", messageId);
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    });

    socket.on("typing", (user) => {
        socket.broadcast.emit("typing", user);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});