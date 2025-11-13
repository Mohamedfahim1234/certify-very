import express from 'express';
import mysql from 'mysql2/promise';
import router from './routes/user.route.js';
import dotenv from 'dotenv';
import Officerouter from './routes/officer.route.js';
dotenv.config();

const app = express();
app.use(express.json());

export const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Venky@2005',
    database: 'venky',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Database pool created successfully');

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         return;
//     }
//     console.log('Connected to the database');
// });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/user',router);
app.use('/officer',Officerouter);
// app.post('/login', async(req, res) => {
//     const { username, email, password, gender } = req.body;

//     if (!username || !email || !password || !gender) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }

//     const existinguser = await Usermodel.findByEmail(email);
//     if (existinguser) {
//         return res.status(409).json({ message: 'User already exists' });
//     }

//     const login = await Usermodel.create(username, email, password, gender);
//     res.json({ message: 'User created', login });
// });

app.listen(8000, () => {
    console.log(`Server is running on port 8000`);
});