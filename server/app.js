const express = require('express');
const fs = require('fs');
const app = express();


app.use((req, res, next) => {
// write your logging code here
    res.on('finish', () => {
        const logFile = './log.csv';
        const logLine = `${req.headers['user-agent']},${new Date().toISOString()},${req.method},${req.url},HTTP/${req.httpVersion},${res.statusCode}\n`;

        if (fs.existsSync(logFile)) {
            const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(line => line !== '');
            if (lines.length >= 20) {
                const files = fs.readdirSync('.').filter(f => f.startsWith('log') && f.endsWith('.csv') && f !== 'log.csv');
                const indices = files.map(f => parseInt(f.replace('log', '').replace('.csv', '')))
                                     .filter(n => !isNaN(n))
                                     .sort((a, b) => b - a);
                for (const idx of indices) {
                    fs.renameSync(`./log${idx}.csv`, `./log${idx + 1}.csv`);
                }
                fs.renameSync(logFile, './log1.csv');
            }
        }
        fs.appendFileSync(logFile, logLine);
    });
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
        return {
            'Agent': values[0],
            'Time': values[1],
            'Method': values[2],
            'Resource': values[3],
            'Version': values[4],
            'Status': values[5]
        };
    });
    res.json(logs);
});

app.get('*', (req, res) => {
    res.status(404).send('Not found');
});

module.exports = app;
