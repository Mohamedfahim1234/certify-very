import { db } from "../index.js";

export const Officermodel = {
    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM officerlogin WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    async create(username, email, password, department) {
       const [result] = await db.execute(
      'INSERT INTO officerlogin (username, email, password, department) VALUES (?, ?, ?, ?)',
       [username, email, password, department]
    );
    return result;
    }
}