import axios from 'axios';
import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import pg from 'pg';

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use;

//Functions

//Check Image if it exists
const preloadImage = (url) => {
  return axios
    .head(url)
    .then((response) => {
      return { url, valid: true };
    })
    .catch((error) => {
      return { url: '', valid: false };
    });
};

//Preload Images for All Books
const preloadImagesForRendering = async (books) => {
  const preloadPromises = books.map(async (book) => {
    const imageUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
    const result = await preloadImage(imageUrl);

    // Logging
    if (result.valid) {
      console.log(`Image for book ${book.title} loaded successfully!`);
    } else {
      console.log(
        `Error loading image for ${book.title}, using fallback image.`
      );
    }
    return result.url;
  });

  return Promise.all(preloadPromises);
};

// Format Dates
const formatDates = async (collection, propertyName) => {
  const datesPromises = collection.map(async (item) => {
    const date = new Date(item[propertyName]);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      ...item,
      formatted_date: formattedDate,
    };
  });

  return Promise.all(datesPromises);
};

// ROUTES
app.get('/', async (req, res) => {
  try {
    const BOOKS_QUERY = `SELECT book.id, book.isbn, book.title, book.read_date, book.rating, book.summary, author.name as "author_name", author.id as "author_id" FROM book
JOIN author on author.id = book.author_id
ORDER BY read_date DESC`;
    const result = await db.query(BOOKS_QUERY);

    const books = result.rows;
    const bookCoverUrls = await preloadImagesForRendering(books);
    const booksWithFormattedDates = await formatDates(books, 'read_date');

    res.render('books/index.ejs', {
      books: booksWithFormattedDates,
      bookCoverUrls,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/books/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const bookQuery = `SELECT book.id, book.isbn, book.title, book.read_date, book.rating, book.summary, author.name as "author_name", author.id as "author_id" FROM book
                      JOIN author on author.id = book.author_id
                      WHERE book.isbn = '${isbn}'
                      ORDER BY read_date DESC`;

    // Get book details
    let result = await db.query(bookQuery);
    const book = result.rows[0];
    // Get image from Open Library and preload it.
    const bookCoverUrl = await preloadImagesForRendering([book]);
    // Format the date
    const bookWithFormattedDate = await formatDates([book], 'read_date');

    // Get notes for the book
    result = await db.query(`SELECT * FROM note WHERE book_id = ${book.id}`);
    const notes = result.rows;
    const notesWithFormattedDates = await formatDates(notes, 'created_at');

    res.render('books/note.ejs', {
      book: bookWithFormattedDate[0],
      notes: notesWithFormattedDates,
      bookCoverUrl,
    });
  } catch (error) {
    console.log(error);
  }
});

// Handle 404 Requests
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Handle all errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
