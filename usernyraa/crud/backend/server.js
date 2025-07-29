const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Nyraa@123",
  database: "nyraa",
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/api/products", (req, res) => {
  const { name, price, description, image_url } = req.body;

  if (!name || !price || !description || !image_url) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    "INSERT INTO products (name, price, description, image_url) VALUES (?, ?, ?, ?)",
    [name, price, description, image_url],
    (err, results) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ error: "Internal Server Error", details: err });
      }
      res.json({ id: results.insertId, name, price, description, image_url });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
