import express from 'express';
import mysql from 'mysql2';
import { Usermodel } from './model/user.model.js';


const app = express();
app.use(express.json());

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Fahim@2005',
    database: 'certifyvery'
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/login', async(req, res) => {
    const { username, email, password, gender } = req.body;
    const login = await Usermodel.create(username, email, password, gender);
    res.json({ message: 'User created', login });
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000`);
});