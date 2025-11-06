import axios from 'axios';
import db from './db.js';
import { capitalizeWords, formatDate, preloadImage } from './utils.js';

const BOOKS_BASE_QUERY = `
  SELECT book.id, book.olid, book.title, book.read_date, book.rating, book.summary, author.name as "author_name", author.id as "author_id" 
  FROM book JOIN author on author.id = book.author_id
`;

const processBooksForRendering = async (books) => {
    const processedBooks = await Promise.all(books.map(async (book) => {
        const imageUrl = `https://covers.openlibrary.org/b/olid/${book.olid}-L.jpg`;
        const result = await preloadImage(imageUrl);

        if(result.valid){
            console.log(`Image for book ${book.title} loaded successfully!`);
        } else{
            console.log(`Error loading image for ${book.title}, using fallback image.`)
        }

        return {
            ...book,
            formatted_date: formatDate(book.read_date),
            bookCoverUrl: result.url,
            title: capitalizeWords(book.title),
            author_name: capitalizeWords(book.author_name),
        }
    }));

    return processedBooks;
}

const formatNotes = async (notes) => {
    return notes.map(note => ({
        ...note,
        formatted_date: formatDate(note.created_at)
    }));
}

// --- API Functions ---

// GET /
export const getAllBooks = async () => {
    const BOOKS_QUERY = `${BOOKS_BASE_QUERY} ORDER BY read_date DESC`;
    const result = await db.query(BOOKS_QUERY);
    const output = processBooksForRendering(result.rows);
    return processBooksForRendering(result.rows);
};

// GET /books/:olid
export const getBookDetails = async (olid) => {
    const bookQuery = `${BOOKS_BASE_QUERY} WHERE book.olid = $1`;

    const bookResult = await db.query(bookQuery, [olid]);
    if(bookResult.rows.length === 0) return null;

    const book = (await processBooksForRendering(bookResult.rows))[0];

    const notesResult = await db.query(`SELECT * FROM note WHERE book_id = $1 ORDER BY created_at DESC`, [book.id]);
    const notes = await formatNotes(notesResult.rows);

    return {book, notes, bookCoverUrl: book.bookCoverUrl};
}

//GET /edit/:olid
export const getBookForEdit = async (olid) => {
    const bookQuery = `${BOOKS_BASE_QUERY} WHERE book.olid = $1`;
    const result = await db.query(bookQuery, [olid]);

    if(result.rows.length === 0) return null;

    const book = result.rows[0];

    book.read_date = new Date(book.read_date).toISOString().split('T')[0];

    book.title = capitalizeWords(book.title);
    book.author_name = capitalizeWords(book.author_name);

    return book;
}

//POST /new
export const addNewBook = async (title, author, readDate, rating, summary) => {
    //Check Open Library API
    const response = await axios.get(`https://openlibrary.org/search.json?title=${title}&author=${author}&limit=1`);

    if(response.data.numFound === 0){
        return { error: 'The book you entered does not exist'};
    }

    const bookData = response.data.docs[0];
    const olid = bookData.cover_edition_key;

    //Search/Insert Author
    let result = await db.query('SELECT id FROM author WHERE name = $1', [author.toLowerCase()]);

    if(result.rows.length === 0){
        result = await db.query('INSERT INTO author (name) VALUES($1) RETURNING id',
          [author.toLowerCase()]);
    }

    const author_id = result.rows[0].id;

    //Check if Book (OLID) exists
    result = await db.query('SELECT olid FROM book WHERE olid = $1', [olid]);
    if(result.rows.length > 0 ){
        return { error: 'The book already exists'};
    }

    await db.query(
        'INSERT INTO book (olid, title, read_date, rating, summary, author_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [olid, title.toLowerCase(), readDate, rating, summary, author_id]
    );

    return { success: true, olid}
}

//POST /edit/:olid
export const updateBook = async (olid, title, author, readDate, rating, summary) => {
    let result = await db.query('SELECT id FROM author WHERE name = $1', [author.toLowerCase()]);
    if (result.rows.length === 0) {
        result = await db.query('INSERT INTO author (name) VALUES($1) RETURNING id', [author.toLowerCase()]);
    }

    const author_id = result.rows[0].id;

    await db.query(
        'UPDATE book SET title = $1, author_id = $2, read_date = $3, rating = $4, summary = $5 WHERE olid = $6',
      [title, author_id, readDate, rating, summary, olid]
    );
}

//POST /delete/:olid
export const deleteBook = async (olid) => {
    const result = await db.query('SELECT  id FROM book WHERE olid = $1', [olid]);
    const bookId = result.rows[0].id;

    //Delete notes associated with the book
    await db.query('DELETE FROM note WHERE book_id = $1', [bookId]);
    //Delete book
    await db.query('DELETE FROM book WHERE id = $1', [bookId]);
}

//POST /books/:olid/note
export const addNote = async (olid, noteContent) =>{
    const result = await db.query('SELECT id FROM book WHERE olid = $1', [olid]);
    const bookId = result.rows[0].id;

    await db.query(
        'INSERT INTO note (content, created_at, book_id) VALUES ($1, $2, $3)',
      [noteContent, new Date(), bookId]
    );
}

//PATCH /books/:olid/note/:noteId
export const updateNote = async (noteId, content) => {
    const result = await db.query('UPDATE note SET content = $1, created_at = NOW() WHERE id = $2 RETURNING created_at',[content, noteId]);

    const newDate = result.rows[0].created_at;
    const formattedDate = formatDate(newDate);

    return {formattedDate};
}