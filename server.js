const path = require("path")

const bcrypt = require("bcryptjs")
const Database = require("better-sqlite3")
const express = require("express")
const session = require("express-session")

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 3000

const dbPath = path.join(__dirname, "app.db")
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

app.use(express.json())
app.use(
  session({
    name: "fitzone.sid",
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  }),
)

function getSessionUser(req) {
  if (!req.session || !req.session.user) return null
  return req.session.user
}

function requireAuthPage(req, res, next) {
  const user = getSessionUser(req)
  if (user) return next()

  const nextPath = req.path.startsWith("/") ? req.path.slice(1) : req.path
  return res.redirect(`/login.html?next=${encodeURIComponent(nextPath)}`)
}

function requireAuthApi(req, res, next) {
  const user = getSessionUser(req)
  if (user) return next()
  return res.status(401).json({ ok: false, error: "UNAUTHORIZED" })
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/plans.html", requireAuthPage, (_req, res) => {
  res.sendFile(path.join(__dirname, "plans.html"))
})

app.get("/bmi.html", requireAuthPage, (_req, res) => {
  res.sendFile(path.join(__dirname, "bmi.html"))
})

app.get("/trainers.html", requireAuthPage, (_req, res) => {
  res.sendFile(path.join(__dirname, "trainers.html"))
})

app.post("/api/auth/register", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : ""
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
  const password = typeof req.body?.password === "string" ? req.body.password : ""

  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "INVALID_EMAIL" })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ ok: false, error: "WEAK_PASSWORD" })
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
  if (existing) {
    return res.status(409).json({ ok: false, error: "EMAIL_IN_USE" })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const info = db
    .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
    .run(email, name || null, passwordHash)

  return res.status(201).json({ ok: true, userId: info.lastInsertRowid })
})

app.post("/api/auth/login", (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
  const password = typeof req.body?.password === "string" ? req.body.password : ""

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "MISSING_CREDENTIALS" })
  }

  const user = db
    .prepare("SELECT id, email, name, password_hash AS passwordHash FROM users WHERE email = ?")
    .get(email)

  if (!user) {
    return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" })
  }

  const ok = bcrypt.compareSync(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" })
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ ok: false, error: "SESSION_ERROR" })

    req.session.user = { id: user.id, email: user.email, name: user.name || "" }
    req.session.save((saveErr) => {
      if (saveErr) return res.status(500).json({ ok: false, error: "SESSION_ERROR" })
      return res.json({ ok: true, user: req.session.user })
    })
  })
})

app.post("/api/auth/logout", (req, res) => {
  if (!req.session) return res.json({ ok: true })

  req.session.destroy(() => {
    res.clearCookie("fitzone.sid")
    res.json({ ok: true })
  })
})

app.get("/api/auth/me", requireAuthApi, (req, res) => {
  res.json({ ok: true, user: getSessionUser(req) })
})

app.use(express.static(__dirname))

const server = app.listen(port, () => {
  process.stdout.write(`Fitzone server running at http://localhost:${port}\n`)
})

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    process.stderr.write(`Port ${port} is already in use.\n`)
    process.stderr.write(`Stop the other process or run with PORT=3001 (example).\n`)
    process.exit(1)
  }
  throw err
})
