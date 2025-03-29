import express from 'express';
import path from 'path';

const app = express();
const port = 3001; // Avoid conflict with React dev server

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
