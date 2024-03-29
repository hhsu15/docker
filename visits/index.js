const express = require('express');
const redis = require('redis');
const process = require('process');

const app = express();
// create redis client
// redis is an in memory database which allows us to store data
const client = redis.createClient({
	host: 'redis-server',  // normally you will use a URL like(www.redis.com) in this case we use container, docker knows that the name and will redirect it to the contanier
	port: 6379 // default port number for redis
});

client.set('visits', 0);

app.get('/', (req, res) =>{
    // exit code 0 means everything is ok
	// anything other than 0 will mean an error
	// this will affects how docker reacts
	//process.exit(0); // imagine something happened to the process
	client.get('visits', (err, visits) => {
		res.send("Number of visits is " + visits);
		client.set('visits', parseInt(visits) + 1); //parseInt converts string to int
	}); 
});

app.listen(8081, () => {
	console.log("Listening on port 8081");
});
