import mysql2 from 'mysql2/promise';
import {config} from 'dotenv';

config();

const db = mysql2.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "attendance_app",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
