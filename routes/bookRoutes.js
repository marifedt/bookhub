import express from 'express';
import * as bookService from '../bookService.js';
const router = express.Router();

//GET /- Home/All Books
router.get('/', async (req, res) => {
    try {
        const books = await bookService.getAllBooks(req.user.id);
        res.render('books/index.ejs', { books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving books.');
    }
});

//GET /books/:olid - Book Details & Notes
router.get('/books/:olid', async (req, res) => {
    try {
        const olid = req.params.olid;
        const data = await bookService.getBookDetails(olid, req.user.id);

        if (!data) return res.status(404).send('Book not found.');

        res.render('books/note.ejs', {
            book: data.book,
            notes: data.notes,
            bookCoverUrl: data.bookCoverUrl,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving book details.');
    }
});

//GET /new - New Book Form
router.get('/new', (req, res) => {
    res.render('books/new.ejs');
});

//GET /edit/:olid
router.get('/edit/:olid', async (req, res) => {
    try {
        const book = await bookService.getBookForEdit(req.params.olid, req.user.id);
        if (!book) return res.status(404).send('Book not found.');

        res.render('books/edit.ejs', { book });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading edit form.');
    }
});

//POST /new
router.post('/new', async (req, res) => {
    const { title, author, readDate, rating, summary } = req.body;
    const result = await bookService.addNewBook(title, author, readDate, rating, summary, req.user.id);

    if (result.success) {
        res.redirect('/');
    } else {
        res.render('books/new.ejs', { error: result.error });
    }
});

//POST /edit/:olid
router.post('/edit/:olid', async (req, res) => {
    const { title, author, readDate, rating, summary } = req.body;
    const olid = req.params.olid;

    try {
        await bookService.updateBook(olid, title, author, readDate, rating, summary, req.user.id);
        res.redirect(`/books/${olid}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating book.');
    }
})

//POST /delete/:olid
router.post('/delete/:olid', async (req, res) => {
    try {
        await bookService.deleteBook(req.params.olid, req.user.id);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting book.');
    }
});

//POST /books/:olid/note = New Book Note
router.post('/books/:olid/note', async (req, res) => {
    const { note } = req.body;
    const olid = req.params.olid;
    try {
        await bookService.addNote(olid, note, req.user.id);
        res.redirect(`/books/${olid}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding note.');
    }
});

//PATCH books/:olid/note/:noteId - Update a note
router.patch('/books/:olid/note/:noteId', async (req, res) => {
    const { content } = req.body;
    const { noteId } = req.params;
    try {
        const { formattedDate } = await bookService.updateNote(noteId, content, req.user.id);

        res.json({
            success: true,
            formatted_date: formattedDate,
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update note.' });
    }
})

export default router;
