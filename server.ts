import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("platform.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    type TEXT DEFAULT 'movie',
    category TEXT DEFAULT 'Action'
  )
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM items").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO items (title, url, thumbnail, type, category) VALUES (?, ?, ?, ?, ?)");
  insert.run("Big Buck Bunny", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "https://picsum.photos/seed/bunny/800/450", "movie", "Animation");
  insert.run("Sintel", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "https://picsum.photos/seed/sintel/800/450", "movie", "Fantasy");
  insert.run("Google Search", "https://www.google.com/search?igu=1", "https://picsum.photos/seed/google/800/450", "app", "Utility");
  insert.run("Calculator App", "https://www.desmos.com/scientific", "https://picsum.photos/seed/calc/800/450", "app", "Utility");
  insert.run("Picasso App", "https://www.google.com/search?q=Picasso+App+Movie+Platform&igu=1", "https://picsum.photos/seed/picasso/800/450", "app", "Movie Platforms");
  insert.run("Moviebox Portal", "https://h5.aoneroom.com", "https://picsum.photos/seed/moviebox/800/450", "app", "Movie Platforms");
}

// Ensure Moviebox exists
const movieboxExists = db.prepare("SELECT COUNT(*) as count FROM items WHERE title = 'Moviebox Portal'").get() as { count: number };
if (movieboxExists.count === 0) {
  db.prepare("INSERT INTO items (title, url, thumbnail, type, category) VALUES (?, ?, ?, ?, ?)")
    .run("Moviebox Portal", "https://h5.aoneroom.com", "https://picsum.photos/seed/moviebox/800/450", "app", "Movie Platforms");
}

// Ensure Picasso App exists even if DB was already seeded
const picassoExists = db.prepare("SELECT COUNT(*) as count FROM items WHERE title = 'Picasso App'").get() as { count: number };
if (picassoExists.count === 0) {
  db.prepare("INSERT INTO items (title, url, thumbnail, type, category) VALUES (?, ?, ?, ?, ?)")
    .run("Picasso App", "https://www.google.com/search?q=Picasso+App+Movie+Platform&igu=1", "https://picsum.photos/seed/picasso/800/450", "app", "Movie Platforms");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items").all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { title, url, thumbnail, type, category } = req.body;
    const info = db.prepare("INSERT INTO items (title, url, thumbnail, type, category) VALUES (?, ?, ?, ?, ?)")
      .run(title, url, thumbnail, type, category);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/items/:id", (req, res) => {
    db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
