const { MongoClient } = require('mongodb');
const config = require('./config');
const url = config.url;

// Connection URL
const client = new MongoClient(url);

module.exports = client;