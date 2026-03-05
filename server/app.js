const express = require('express');
const fs = require('fs');
const app = express();


app.use((req, res, next) => {
// write your logging code here
let logFile = fs.createWriteStream('./log.csv', {flags: 'a'}); //use {flags: 'w'} to open in write mode
//Log agent, time, method, resource, version, and status to the csv file
logFile.write(`${req.headers['user-agent']},${new Date().toISOString()},${req.method},${req.url},${req.httpVersion},${res.statusCode}\n`); //write log data to the file
logFile.end();
next();
});

app.get('/', (req, res) => {
// write your code to respond "ok" here
console.log(`${req.headers['user-agent']},${new Date().toISOString()},${req.method},${req.url},HTTP/${req.httpVersion},${res.statusCode}\n`); //log the request body to the console
    res.json({status: 'ok'}); //send a json response with the message "ok"
});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
    const logData = fs.readFileSync('./log.csv', 'utf-8');
    const lines = logData.trim().split('\n').filter(line => line);
    const logs = lines.map(line => {
        const values = line.split(',');
        // The last 5 fields are guaranteed not to have commas.
        // The first field is the user agent and it might contain commas.
        return {
            'Agent': values.slice(0, values.length - 5).join(','),
            'Time': values[values.length - 5],
            'Method': values[values.length - 4],
            'Resource': values[values.length - 3],
            'Version': values[values.length - 2],
            'Status': values[values.length - 1]
        };
    });
    res.json(logs);
});

module.exports = app;
