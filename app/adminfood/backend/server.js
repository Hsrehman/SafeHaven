const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json()); 
app.use(cors()); 


let users = [];
app.get("/users", (req, res) => {
  res.status(200).json({
    message: "Users fetched successfully!",
    data: users,
  });
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required!" });
  }
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);

  res.status(201).json({
    message: "User added successfully!",
    data: newUser,
  });
});
app.get("/", (req, res) => {
  res.send("Welcome to the API! Use /users to interact with the fake database.");
});
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});