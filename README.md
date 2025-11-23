# 📚 BookHub

BookHub is a personal book tracker web app that lets users manage a list of books they've read, are currently reading, or plan to read. Users can add, update, delete, and view books — complete with cover images fetched using the Open Library Covers API.

**Now with User Authentication and Cloud Database support!**

---

## 🚀 Project Objectives

- Practice integrating **public APIs** into web projects
- Gain hands-on experience with **Node.js** and **Express**
- Demonstrate full **CRUD** operations with a **PostgreSQL** database
- Implement **User Authentication** and **Data Isolation**
- Create a clean, responsive frontend using **HTML, CSS, JavaScript, and EJS**
- Present and sort data in a user-friendly interface

---

## 🧠 Features

- 🔐 **User Authentication**: Secure Login and Registration using Passport.js
- 👤 **Data Isolation**: Users can only see and manage their own books
- 🔍 **Fetch Book Covers** using Open Library Covers API
- 📝 **Add / Edit / Delete** book entries with personal notes or ratings
- 📊 **Sort books** by read date
- ☁️ **Cloud Database**: Powered by Supabase (PostgreSQL)
- 🖼️ Display book data dynamically using **EJS templating**
- 🔧 Built-in **error handling** for API and database operations

---

## 🛠 Tech Stack

- **Node.js** / **Express**
- **PostgreSQL** (Supabase)
- **Passport.js** (Local Strategy)
- **EJS**
- **Axios**
- **HTML / CSS / JavaScript**
- **Open Library Covers API**

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/marifedt/bookhub.git
cd bookhub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase (PostgreSQL)

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to the **SQL Editor** in Supabase and run the scripts found in `queries.sql` to create the necessary tables (`users`, `book`, `author`, `note`, `session`).
3.  Get your database connection details from **Project Settings > Database**.

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
PG_USER=postgres
PG_HOST=db.your-project-ref.supabase.co
PG_DATABASE=postgres
PG_PASSWORD=your-db-password
PG_PORT=5432
SESSION_SECRET=your-secret-key
```

### 5. Start the Server

```bash
npm run dev
```

Then open your browser and go to:
http://localhost:3000

---

## ⚙️ API Integration

This project uses the Open Library Covers API to dynamically fetch book cover images based on ISBNs or OLIDs.

Example usage:

```js
https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg
```

## ✨ Future Improvements

- Pagination for large libraries
- Better form validation and input sanitization

## 💬 Questions or Feedback?

Have ideas, found a bug, or just want to share how you're using BookHub?
Feel free to open an issue or start a discussion in the repository.
Contributions, suggestions, and feedback are always welcome!
