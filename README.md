# Unified Email-Based Authentication System

A minimal, secure, and modern passwordless authentication flow where **login and signup are unified into a single email-only action**.

## Architecture & Flow

Instead of separating Login and Signup views:
1. The user enters their email and clicks **Login**.
2. The system checks if the email exists in the SQLite database.
3. **If it exists:** Logs the user in directly (existing user authentication).
4. **If it does not exist:** Automatically creates a new user profile in the database and logs them in.

This setup prevents unnecessary onboarding friction and avoids complex password management.

```
       User enters email
               ↓
          Click Login
               ↓
         Validate email
               ↓
      Send email to backend
               ↓
     Check SQLite database
               ↓
         ┌───────────────┐
         │ Email exists? │
         └───────┬───────┘
             Yes │ No
                 │
          ┌──────┴──────┐
          ↓             ↓
        Login        Create user
          ↓             ↓
          └──────┬──────┘
                 ↓
            Authenticate
                 ↓
         Show logged-in state
```

## Tech Stack
- **Frontend:** HTML5, CSS3 (Modern Glassmorphic styling), Vanilla JavaScript
- **Backend:** Node.js + Express
- **Database:** SQLite3

## Directory Structure
```
project/
├── public/
│   ├── index.html     # Client interface & templates
│   ├── style.css      # Rich glassmorphic aesthetic styles
│   └── script.js      # Client authentication handler & view router
├── database/
│   └── database.sqlite # SQLite Database file (auto-generated)
├── server.js          # Express app server, DB schema, & auth routing
├── package.json       # App metadata & dependencies
└── README.md          # Documentation & verification guide
```

## Installation & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Application:**
   ```bash
   npm start
   ```
   Or start in watch/development mode:
   ```bash
   npm run dev
   ```

3. **Access the Page:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Verification Checklist

Follow these steps to verify the system works correctly:
1. **Invalid Input Rejection:** Enter an invalid email (e.g. `test@invalid`, or blank text) and verify that the client-side/server-side validations reject it and display an error.
2. **New User Registration:** Enter an email that is not in the database (e.g., `newuser@example.com`). Click **Login**. Verify it says **"New User Created"** and shows their generated User ID.
3. **Database Insertion Verification:** Verify that the database file `database/database.sqlite` has been successfully created.
4. **Existing User Sign In:** Enter the same email address (`newuser@example.com`) again. Verify that it says **"Existing User"** and loads the user ID that matches the database entry from Step 2, without creating duplicates.
5. **No Password/Signup Link Present:** Ensure there are no links to alternative signups or passwords to preserve the strict unified authentication constraint.
