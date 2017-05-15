import express from 'express';

const app = express();
app.get('/', (req, res) => res.send('it works!!'));
app.listen(4000);