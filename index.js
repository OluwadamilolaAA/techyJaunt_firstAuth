const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const userRouter = require('./src/routes/user.routes');
const carRouter = require('./src/routes/cars.routes');
const flwRoute = require('./src/routes/flutterwave.routes');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3500;


app.use(express.json());
app.use(morgan('dev'))

app.use('/api/users', userRouter);
app.use('/api/cars', carRouter);
app.use('/api/webhook', flwRoute);

app.get('/', (req, res) => {
    res.send('Welcom to my page!')
})

app.listen(PORT, () => {
    connectDB();
    console.log(`server is running on http://localhost:${PORT}`);
})