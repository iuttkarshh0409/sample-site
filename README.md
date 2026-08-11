# Unified Email-Based Authentication System

A modular, secure, and modern passwordless authentication flow where **login and signup are unified into a single email-only action**. All SQLite CRUD operations are decoupled from the routing logic and managed via a dedicated database service layer.

## Architecture & Flows

The project enforces a strict separation of concerns, keeping routers, services, and the database driver isolated:

```
    [ Frontend UI ]
    (/login, /users)
           ↓
    [ REST API Routes ]
  (routes/auth, routes/users)
           ↓
   [ UserService Layer ]
  (services/userService.js)
           ↓
  [ SQLite Database Driver ]
    (database/database.js)
```

### 🔐 Unified Authentication Flow
1. The user enters their email at `/login` and submits the form.
2. The client submits a `POST /api/auth/login` request.
3. The auth router queries the `userService` to check if the user exists.
4. **If they exist:** Authenticates the user and returns their profile.
5. **If they do not exist:** Automatically creates their record in SQLite and returns the newly registered profile.

### 👥 User CRUD Flow
1. Navigate to `/users` (User Management page).
2. The page loads all users from `GET /api/users` and renders them in a list.
3. Forms and actions allow you to:
   - **Create:** `POST /api/users`
   - **View:** `GET /api/users/:id`
   - **Update:** `PUT /api/users/:id`
   - **Delete:** `DELETE /api/users/:id`

---

## Directory Structure

```
project/
├── public/
│   ├── index.html       # Email-only authentication page
│   ├── style.css        # Premium glassmorphic styling
│   ├── script.js        # Authentication script (Fetch API handler)
│   └── users.html       # Minimal User Management (CRUD) dashboard
├── routes/
│   ├── auth.js          # Authentication router (/api/auth)
│   └── users.js         # User CRUD router (/api/users)
├── services/
│   └── userService.js   # Database interface layer (CRUD service)
├── database/
│   ├── database.js      # SQLite connection & table initialization
│   └── database.sqlite  # SQLite Database file (auto-generated)
├── server.js            # Express server initialization & page routing
├── package.json         # Dependencies & dev scripts
└── README.md            # Project guide
```

---

## Installation & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Application:**
   ```bash
   npm start
   ```
   Or start in hot-reload watch/development mode:
   ```bash
   npm run dev
   ```

3. **Access the Interfaces:**
   - **Authentication Gate:** [http://localhost:3000/login](http://localhost:3000/login)
   - **User CRUD Dashboard:** [http://localhost:3000/users](http://localhost:3000/users)

---

## Verification & API Checklist

### 1. Unified Authentication (`/login`)
- Navigate to `/login`.
- Input a new email address (e.g. `user_new@example.com`). Verify that a `201` response is returned and a **"New User Created"** badge is displayed.
- Click **"Test Another Email"** and re-enter the same email. Verify that a `200` response is returned and the **"Existing User"** badge is displayed with matching database details.
- Input an invalid string (e.g., `invalid-email`). Verify that validation flags the format and rejects it.

### 2. User CRUD Dashboard (`/users`)
- Navigate to `/users`.
- **Create**: Input an email and click **Create User**. Verify the user row appends to the table.
- **View**: Click **View** on a user. Verify their details (ID, Email, Joined Date) display in the Details panel.
- **Edit**: Click **Edit** on a user. The form field should fill. Change the value, click **Update User**, and check if the table updates immediately.
- **Delete**: Click **Delete** on a user and confirm. Verify the row is removed.
