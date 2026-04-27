import db from '../config/db.js';

const getAllUsers = async() => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
};
const getUserByEmail = async(email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async(userData) => {
    const { full_name, email, password, phone } = userData;
    const [result] = await db.query(
        'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
        [full_name, email, password, phone]
    );
    return result.insertId;
};

export default {
    getAllUsers,
    getUserByEmail,
    createUser
};