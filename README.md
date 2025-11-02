# 📚 BookHub

BookHub is a personal book tracker web app that lets users manage a list of books they've read, are currently reading, or plan to read. Users can add, update, delete, and view books — complete with cover images fetched using the Open Library Covers API.

---

## 🚀 Project Objectives

- Practice integrating **public APIs** into web projects
- Gain hands-on experience with **Node.js** and **Express**
- Demonstrate full **CRUD** operations with a **PostgreSQL** database
- Create a clean, responsive frontend using **HTML, CSS, JavaScript, and EJS**
- Present and sort data in a user-friendly interface

---

## 🧠 Features

- 🔍 **Fetch Book Covers** using Open Library Covers API
- 📝 **Add / Edit / Delete** book entries with personal notes or ratings
- 📊 **Sort books** by read date
- 💾 **Persistent data storage** via PostgreSQL
- 🖼️ Display book data dynamically using **EJS templating**
- 🔧 Built-in **error handling** for API and database operations

---

## 🛠 Tech Stack

- **Node.js** / **Express**
- **PostgreSQL**
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

### 3. Set Up PostgreSQL

- Create a local PostgreSQL database (e.g., bookhub_db)
- Use the SQL schema provided in queries.sql (if applicable) or create your own based on your data structure.
- Configure your connection string in a .env file

```sql
  PG_USER="<your_username>"
  PG_HOST="<your_host>"
  PG_DATABASE="<your_db-name>"
  PG_PASSWORD="<your_password>"
  PG_PORT="<port_number>"
```

### 4. Start the Server

```bash
    npm run dev
```

Then open your browser and go to:
http://localhost:3000

## ⚙️ API Integration

This project uses the Open Library Covers API to dynamically fetch book cover images based on ISBNs or OLIDs.

Example usage:

```js
    https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg
```

## ✨ Future Improvements

- Add user authentication to track different users' books
- Pagination for large libraries
- Better form validation and input sanitization

## 💬 Questions or Feedback?

Have ideas, found a bug, or just want to share how you're using BookHub?  
Feel free to open an issue or start a discussion in the repository.  
Contributions, suggestions, and feedback are always welcome!
