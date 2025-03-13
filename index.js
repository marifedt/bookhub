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

// ROUTES
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM book');
    const books = result.rows;

    const bookCoverUrls = await preloadImagesForRendering(books);

    res.render('index.ejs', {
      books,
      bookCoverUrls,
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
