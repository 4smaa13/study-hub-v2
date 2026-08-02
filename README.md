# Study Hub v2 (React rewrite)

A React + Firebase rewrite of the original [Study Hub](https://study-with-me13.netlify.app/) project — a collaborative platform for students to create study "rooms" with task boards, a Pomodoro timer, live video, shared links/PDFs, and chat.

**This is Phase 1**: project scaffold, authentication, and room join/create. More features land in later phases (see Roadmap below).

## Stack
- React 18 + Vite
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. In the project, click "Add app" → Web (`</>`) to register a web app. Copy the config object it gives you.
3. Paste those values into `src/lib/firebase.js`, replacing the placeholder strings.
4. In the Firebase console:
   - **Authentication** → Sign-in method → enable **Email/Password**.
   - **Firestore Database** → Create database → start in **test mode** (for local dev only — see security note below).
   - **Storage** → Get started (needed for later phases: PDFs, schedule images).
5. (Optional but recommended) Deploy the included `firestore.rules` file using the Firebase CLI once you're past test mode:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 3. Run it
```bash
npm run dev
```
Visit the local URL Vite prints (usually `http://localhost:5173`).

## Project Structure
```
src/
  components/
    Auth/       Login, Signup forms
    Room/       Join, Create, and Header for a study room
    Timer/      Pomodoro timer (Phase 2)
    Tasks/      Task board (Phase 2)
    Links/      Shared links + PDFs (Phase 3)
    Schedule/   Schedule image upload/viewer (Phase 3)
    Chat/       Room chat (Phase 4)
    VideoCall/  Live video sessions (Phase 5)
  context/
    AuthContext.jsx   Tracks logged-in user, exposes login/signup/logout
    RoomContext.jsx   Tracks current room, exposes join/create/delete/leave
  lib/
    firebase.js       Firebase app initialization
  App.jsx             Top-level view routing (auth → room → dashboard)
```

## Roadmap
- [x] Phase 1: Scaffold + Auth + Room join/create
- [ ] Phase 2: Task board + Pomodoro timer
- [ ] Phase 3: Links, PDF sharing, schedule image upload
- [ ] Phase 4: Real-time room chat
- [ ] Phase 5: Live video sessions (WebRTC)

## Security Note
Firestore "test mode" allows open read/write for 30 days — fine for local development, **not for production**. Before deploying live, apply `firestore.rules` (included in this repo) which restricts access to authenticated users only.
