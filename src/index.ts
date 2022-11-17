import express from 'express';
import * as fs from 'node:fs/promises';

const app = express();
const port = 3000;

const response = () => {
    let count = 0;
    return function(request: express.Request, response: express.Response) {
        if (!request) return;
        response.json({ message: `Olá, mundo! ${String(++count)}` });
    };
};

app.get('/api', response());

app.get('/api/village', async (request: express.Request, response: express.Response) => {
    if (!request) return;

    const village = await fs.readFile('dist/village.txt', { encoding: 'utf-8' });
    response.send(village);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});