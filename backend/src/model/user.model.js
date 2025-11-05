import { db } from "..";

export const Usermodel = {

    async create(username,email, password,gender) {
        const [result] = await db.execute(
            'INSERT INTO userlogin (username, email, password, gender) VALUES (?, ?, ?, ?)',
            [username, email, password, gender]
        );
        return result;
    }
}

