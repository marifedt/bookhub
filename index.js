import bodyParser from 'body-parser';
import express from 'express';
import { connectDB } from './db.js';
import bookRoutes from './routes/bookRoutes.js';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/', bookRoutes);

// Handle 404 Requests
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Handle all errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Startup Function
async function startServer() {
  try {
    await connectDB();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (err) {
    process.exit(1);
  }
}

startServer();
