import express = require('express');

const app = express();
const port = 3000;

app.get('/api', (request, response) => {
    if (!request) return;
    response.json({ message: 'Olá, mundo!' });
});

app.listen(port, () => {
    console.log(`App listening on ${port}`);
});