const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/.env' });

//db connection
// connectDB();

//route files
const auth = require('./routes/auth');
const file = require('./routes/file');
const admin = require('./routes/admin');



const app = express();

//bodyparser
app.use(express.json());

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//fileupload middleware
app.use(fileupload());

//set security headers
// app.use(helmet());


//Enable CORS
app.use(cors())

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/file', file);
app.use('/api/v1/admin', admin);



// route to api documentation
app.get("/", (req, res) => {

    res.status(301).redirect("https://documenter.getpostman.com/view/12085227/UVXbtyqT")

})


app.use(errorHandler);
const PORT = process.env.PORT || 3000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));

//handle promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    //close server and exit process
    server.close(() => process.exit(1));
})