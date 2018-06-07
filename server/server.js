var express = require('express');
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
var app = express(); 

// connect to mongo, brick_server database, scores collection
app.db = mongojs('brick_server', ['scores']);

// parse incoming requests
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post("/submitScore", submitscore)

function submitscore(req, res){
	console.log("submit asked");
	if(!req.body.score || !req.body.name){
		res.send({error: "missing data batch"});
		return;
	}
	var score = parseInt(req.body.score);
	var name  = req.body.name;
	console.log({name:name, score:score});
	app.db.scores.insert({name:name, score:score}, function(err){
		if(err){
			console.log("failed to submit: "+ err);
			res.send({error: "submit score internal error"});
			return;
		} 
		res.send({success:true});
	})
}
app.get("/", function(req,res){
	res.send("high score here");
	console.log("get high score");
})
app.post("/highScore", highscore);

function highscore(req, res){
	console.log("highscore asked");
	app.db.scores.find({},{_id:0}).sort({score:-1}).limit(10).toArray(function(err, result){
		if(err){
			console.log("failed to find scores: " + err); 
			res.send({error: "highscore internal error"});
			return;
		}
		console.log(result);
		res.send({success:true , score:result});
	})
}

var server = app.listen(8080, function(){
	console.log("listening on port 8080");
})
