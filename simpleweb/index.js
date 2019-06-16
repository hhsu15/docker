const express = require('express')

const app = express();

app.get('/', (req, res) => {
	res.send("Hi there!!!");
});

app.get('/profile', (req, res) => {
	res.send('this is my profile');
})

app.listen(8080, () => {
	console.log("Listening on port 8080");
});
