const { Client } = require('pg');
const postgresUrl = 'postgres://localhost/twitterdb';
const client = new Client(postgresUrl);
client.connect();
module.exports = client;