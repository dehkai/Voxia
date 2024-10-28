const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.json());

const DBpath = 'rag-rasa_mongo_1'
const DBName = 'rag-rasa'

mongoose.connect(`mongodb://${DBpath}/${DBName}`, { useNewUrlParser: true });

const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});