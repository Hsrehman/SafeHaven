import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const client = new MongoClient(process.env.MONGODB_URI);

// ✅ Function to ensure DB connection
async function connectDB() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
}

// ✅ Fetch all messages
router.get("/", async (req, res) => {
    try {
        await connectDB();
        const database = client.db("safeHaven");
        const messages = database.collection("messages");
        const allMessages = await messages.find().toArray();

        res.status(200).json(allMessages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ User sends a message
router.post("/send", async (req, res) => {
    try {
        await connectDB();
        const database = client.db("safeHaven");
        const messages = database.collection("messages");
        const { from, text } = req.body;

        if (!from || !text) {
            return res.status(400).json({ message: "Sender and text are required" });
        }

        const message = { from, to: "Admin", text, timestamp: new Date().toISOString() };
        await messages.insertOne(message);

        res.status(200).json({ success: true, message });
    } catch (error) {
        console.error("❌ Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Admin replies to a user
router.post("/admin-reply", async (req, res) => {
    try {
        await connectDB();
        const database = client.db("safeHaven");
        const messages = database.collection("messages");
        const { to, text } = req.body;

        if (!to || !text) {
            return res.status(400).json({ message: "Receiver and text are required" });
        }

        const message = { from: "Admin", to, text, timestamp: new Date().toISOString() };
        await messages.insertOne(message);

        res.status(200).json({ success: true, message });
    } catch (error) {
        console.error("❌ Error replying to user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Delete all messages (Use Postman for testing)
router.delete("/", async (req, res) => {
    try {
        await connectDB();
        const database = client.db("safeHaven");
        const messages = database.collection("messages");

        const result = await messages.deleteMany({});
        res.status(200).json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        console.error("❌ Error deleting messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;