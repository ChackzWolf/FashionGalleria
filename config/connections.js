require('dotenv').config();
const mongoose = require('mongoose');


// const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/mydatabase'
// const database = "mongodb+srv://jacksoncheriyan05:YRCJu6YMkgCD8Tqq@cluster1.oahqgko.mongodb.net/?retryWrites=true&w=majority";


const connectDB = async () => {
    mongoose.set("strictQuery", true);
    const db = await mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log('Database connected'))
        .catch(err => console.log(err + "DB not connected"));
}

module.exports = connectDB
