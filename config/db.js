const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connections[0]?.readyState === 1) {
        return;
    }
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
