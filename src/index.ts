import * as express from 'express';

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

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});