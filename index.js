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
app.use(bodyParser.json());
app.use(express.static('public'));

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
    const imageUrl = `https://covers.openlibrary.org/b/olid/${book.olid}-L.jpg`;
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

const formatTitleAndAuthor = async (books) => {
  const booksPromises = books.map(async (book) => {
    return {
      ...book,
      title: capitalizeWords(book.title),
      author_name: capitalizeWords(book.author_name),
    };
  });

  return Promise.all(booksPromises);
};

const capitalizeWords = (str) => {
  if (!str) return '';

  const words = str.split(' ');

  const capitalizedWords = words.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1);
    return firstLetter + restOfWord;
  });

  return capitalizedWords.join(' ');
};

// ROUTES
app.get('/', async (req, res) => {
  try {
    const BOOKS_QUERY = `SELECT book.id, book.olid, book.title, book.read_date, book.rating, book.summary, author.name as "author_name", author.id as "author_id" FROM book
JOIN author on author.id = book.author_id
ORDER BY read_date DESC`;
    const result = await db.query(BOOKS_QUERY);

    const books = result.rows;
    const bookCoverUrls = await preloadImagesForRendering(books);
    const booksWithFormattedDates = await formatDates(books, 'read_date');
    const formattedBooks = await formatTitleAndAuthor(booksWithFormattedDates);

    res.render('books/index.ejs', {
      books: formattedBooks,
      bookCoverUrls,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/books/:olid', async (req, res) => {
  try {
    const olid = req.params.olid;
    const bookQuery = `SELECT book.id, book.olid, book.title, book.read_date, book.rating, book.summary, author.name as "author_name", author.id as "author_id" FROM book
                      JOIN author on author.id = book.author_id
                      WHERE book.olid = '${olid}'
                      ORDER BY read_date DESC`;

    // Get book details
    let result = await db.query(bookQuery);
    const book = result.rows[0];

    // Get image from Open Library and preload it.
    const bookCoverUrl = await preloadImagesForRendering([book]);
    // Format the date
    const bookWithFormattedDate = await formatDates([book], 'read_date');

    // Format the title and author
    const formattedBook = await formatTitleAndAuthor(bookWithFormattedDate);

    // Get notes for the book
    result = await db.query(`SELECT * FROM note WHERE book_id = ${book.id}`);
    const notes = result.rows;
    const notesWithFormattedDates = await formatDates(notes, 'created_at');

    res.render('books/note.ejs', {
      book: formattedBook[0],
      notes: notesWithFormattedDates,
      bookCoverUrl,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/new', (req, res) => {
  res.render('books/new.ejs');
});

app.get('/edit/:olid', async (req, res) => {
  const olid = req.params.olid;
  const bookQuery = `SELECT book.id, book.olid, book.title, book.read_date, book.rating, book.summary, author.name as "author_name", author.id as "author_id" FROM book
                      JOIN author on author.id = book.author_id
                      WHERE book.olid = '${olid}'
                    `;
  try {
    // Get book details
    let result = await db.query(bookQuery);
    const book = result.rows[0];
    book.read_date = new Date(book.read_date).toISOString().split('T')[0];
    const formattedBook = await formatTitleAndAuthor([book]);
    res.render('books/edit.ejs', {
      book: formattedBook[0],
    });
  } catch (error) {
    console.log(error);
  }
});

app.post('/new', async (req, res) => {
  const author = req.body.author.toLowerCase();
  const title = req.body.title.toLowerCase();
  const { readDate, rating, summary } = req.body;

  try {
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${title}&author=${author}&limit=1`
    );

    // Book exists
    if (response.data.numFound > 0) {
      const bookData = response.data.docs[0];
      const olid = bookData.cover_edition_key;

      console.log('Book exists!! continue adding it');
      console.log(`OLID IS: ${olid}`);

      // Search if author already exists and return author id
      let result = await db.query('SELECT id FROM author WHERE name = $1', [
        author,
      ]);

      if (result.rows.length === 0) {
        // Author doesn't exist on DB
        result = await db.query(
          'INSERT INTO author (name) VALUES($1) RETURNING *',
          [author]
        );
      }

      const author_id = result.rows[0].id;

      // Search if OLID exists
      result = await db.query('SELECT olid FROM book WHERE olid = $1', [olid]);

      if (result.rows.length === 0) {
        // Book doesn't exist. So I could add.
        result = await db.query(
          'INSERT INTO book (olid, title, read_date, rating, summary, author_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [olid, title, readDate, rating, summary, author_id]
        );
        res.redirect('/');
      } else {
        res.render('books/new.ejs', {
          error: 'The book already exists',
        });
      }
    } else {
      res.render('books/new.ejs', {
        error: 'The book you entered does not exist',
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post('/edit/:olid', async (req, res) => {
  const { title, author, readDate, rating, summary } = req.body;
  const olid = req.params.olid;

  try {
    //Get author_id from author name
    let result = await db.query('SELECT id FROM author WHERE name = $1', [
      author.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      //Author doesn't exist on DB
      result = await db.query(
        'INSERT INTO author (name) VALUES($1) RETURNING *',
        [author.toLowerCase()]
      );
    }
    const author_id = result.rows[0].id;

    result = await db.query(
      'UPDATE book SET title = $1, author_id = $2, read_date = $3, rating = $4, summary = $5 WHERE olid = $6',
      [title, author_id, readDate, rating, summary, olid]
    );
    res.redirect(`/books/${olid}`);
  } catch (error) {
    console.log(error);
  }
});

app.post('/delete/:olid', async (req, res) => {
  const olid = req.params.olid;
  try {
    // Search id of the book using OLID
    const result = await db.query('SELECT id FROM book WHERE olid = $1', [
      olid,
    ]);

    const bookId = result.rows[0].id;
    // Delete notes associated with the book
    await db.query('DELETE FROM note WHERE book_id = $1', [bookId]);

    // Delete book
    await db.query('DELETE FROM book WHERE id = $1', [bookId]);
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

//New Book Note
app.post('/books/:olid/note', async (req, res) => {
  const { note } = req.body;
  const olid = req.params.olid;
  try {
    // Get book id using OLID
    const result = await db.query('SELECT id FROM book WHERE olid = $1', [
      olid,
    ]);
    const bookId = result.rows[0].id;

    //Add new note
    await db.query(
      'INSERT INTO note (content, created_at, book_id) VALUES ($1, $2, $3)',
      [note, new Date(), bookId]
    );

    res.redirect(`/books/${olid}`);
  } catch (error) {
    console.log(error);
  }
});

//Edit Book Note
app.patch('/books/:olid/note/:noteId', async (req, res) => {
  const { content } = req.body;
  const { noteId } = req.params;
  try {
    const result = await db.query(
      'UPDATE note SET content = $1, created_at = NOW() WHERE id = $2 RETURNING created_at',
      [content, noteId]
    );
    const newDate = result.rows[0].created_at;
    console.log(newDate);

    const formattedDate = new Date(newDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log(formattedDate);

    res.json({ 
      success: true, 
      formatted_date: formattedDate 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update note.' });
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
