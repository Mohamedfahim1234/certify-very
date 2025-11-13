import { db } from "../index.js";

export const Usermodel = {
    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM userlogin WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    async create(email, otp) {
        const [result] = await db.execute(
            'INSERT INTO userlogin (email, otp) VALUES (?, ?)',
            [email, otp]
        );
        return result;
    },
 
    async update(email, otp){
        const [result] = await db.execute(
            'UPDATE userlogin SET otp = ? WHERE email = ?',
            [otp, email]
        );
        return result;
    }
}
