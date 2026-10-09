# QuizArena — Real-Time Classroom Quiz Platform

> **BUILT BY ANKUR BHOWMICK**  
> **Computer Science Department — Bhairab Ganguly College**

**QuizArena** is a complete, production-ready, interactive multiplayer quiz platform designed for classrooms, events, and live trivia challenges. Inspired by modern game-show mechanics, QuizArena features an original visual brand identity, real-time Socket.IO synchronization, an anti-cheat scoring engine, live camera QR code joining, and custom mobile touch controls.

---

## 🚀 Key Features

### 1. Dual-Screen Classroom Gameplay
* **Host / Projector Screen (`/host/game/:gameId`)**: Displays the 6-digit room code, live connected player roster, question text, option choices, countdown timer, live distribution charts, and animated podium rankings.
* **Student Mobile Screen (`/student/game/:gameId`)**: Tactile, touch-optimized screen displaying **ONLY 4 large colored choice controls** (🔴 ▲ Red Triangle, 🔵 ◆ Blue Diamond, 🟡 ● Yellow Circle, 🟢 ■ Green Square). Questions are projected on the host screen to replicate authentic classroom dynamics.

### 2. Real-Time Socket.IO State Machine
* **Anti-Cheat Validation**: Server-controlled timers, server-side score calculation based on millisecond response times, and single answer submission enforcement per question.
* **Live Statistics & Distribution**: Real-time response counts and bar chart visualizations after every question.
* **Resilient Reconnection**: Automatic state recovery for students or hosts experiencing temporary network drops.

### 3. Educator Quiz Library & Editor
* Full CRUD for Quizzes & Questions (Multiple Choice & True/False).
* Customizable timers (5s to 90s), base points, categories, difficulties, and optional image attachments.
* One-click Quiz Duplication & Reordering.

---

## 🛠️ Technology Stack

* **Frontend**: React, Vite, Tailwind CSS, Lucide React, Framer Motion, Canvas Confetti
* **Backend**: Node.js, Express.js, Socket.IO, JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit
* **Database**: MongoDB (Mongoose) with automatic fall-back to `mongodb-memory-server` if no local MongoDB instance is running.

---

## 📁 Directory Structure

```
/frontend
  /src
    /components     # Navbar, Footer, ProtectedAdminRoute
    /context        # AuthContext, SoundContext (Web Audio API Synthesizer)
    /pages          # Landing, Login, Register, AdminDashboard, QuizEditor, StudentJoin, StudentGame, HostGame
    /services       # Axios API client, Socket.IO manager
    /utils          # Choice configurations & constants
    App.jsx
    main.jsx
/backend
  /config           # MongoDB & MongoMemoryServer auto-connect
  /controllers      # Auth, Quiz CRUD, Game Session controllers
  /middleware       # JWT protect, Error handler
  /models           # User, Quiz, GameSession schemas
  /routes           # Auth, Quiz, Game API routes
  /socket           # Real-Time Game State Machine
  /utils            # Seed data & 6-digit room code generator
  /scripts          # 20+ Student automated simulation test script
  server.js
```

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
* Node.js v18+ and npm installed.

### 2. Backend Setup (`/backend`)

```bash
cd backend
npm install
npm run dev
```

The server will automatically:
1. Connect to MongoDB (or launch an in-memory MongoDB instance automatically).
2. Seed the database with demo admin credentials and a sample 15-question trivia quiz (*"General Knowledge Challenge"*).
3. Start the Express & Socket.IO server on `http://localhost:5000`.

### 3. Frontend Setup (`/frontend`)

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

* **Host / Educator Login**:
  * **Email**: `admin@example.com`
  * **Password**: `Admin@123`
* *(Or use the "One-Click Demo Admin Login" button on `/admin/login`)*

---

## 🧪 Testing with 20+ Simulated Students

To stress-test real-time room performance:

1. Log in as Host (`admin@example.com`) and start a game session from the Admin Dashboard.
2. Note the 6-digit room code displayed on screen (e.g. `482731`).
3. Run the automated simulation script in your terminal:

```bash
cd server
node scripts/simulate_20_students.js <ROOM_CODE>
```

This will spawn 25 distinct Socket.IO student clients, join the game, answer questions with realistic delays, and log live rankings to your terminal!

---

## 🚢 Deployment & Production Build

### Frontend Production Build
```bash
cd client
npm run build
```

### Server Production Launch
Set environment variables in `server/.env`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quizarena
JWT_SECRET=your_production_super_secret_jwt_key
```

Run production server:
```bash
cd server
npm start
```

---

## 🔒 Security & Anti-Cheat Measures

* JWT Tokens for protected Admin routes.
* Passwords hashed using `bcrypt` with 10 salt rounds.
* Strict server-side game state validations preventing late answer submissions or client score tampering.
* Helmet security headers & Express rate limiting enabled.
