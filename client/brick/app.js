var canvas;
var stage;
var scoreboard;
var scorestage;

var vel = 2, velx = 2, vely = -2;
var block;
var paddle;
var messenger; 
var scoreField;
var scoreboard_text=[];
var levelField;
var bricks = [];			//bricklist

var preload;				//preload files

var difficulty = 0;
var score = 0;
var scores;
var submitted = false; 		// for submitting only once

var KEYCODE_LEFT = 37;		//useful keycode
var KEYCODE_RIGHT = 39;		//useful keycode
var KEYCODE_A = 65;			//useful keycode
var KEYCODE_D = 68;			//useful keycode

var lhold=false;			//wether the keys are being held
var rhold=false;
var alive=false;

var input;
var modal;
var modal_close;

var username = "";

var url;
var submit_url;
var highscore_url;
var submitscore = function(score, callback){
	console.log("submit called")
	$.post(submit_url, {name:escape(username), score:score}, function(data){
		if(!data){
			console.log("Communication error with server");
			callback && callback(false);
		}
		if(data.error){
			console.log("Server error: " + data.error);
			callback && callback(false);
		}
		callback && callback(true);
	})
}


var highscore = function(callback){
	console.log("highscore called")
	$.post(highscore_url, null, function(data){
		if(!data){
			console.log("Communication error with server");
			callback && callback(false);
		}
		if(data.error){
			console.log("Server error: " + data.error);
			callback && callback(false);
		}
		callback && callback(data);
	})
}

function load(){
	preload = new createjs.LoadQueue(true, '');
	preload.addEventListener("progress", updateloading);
	preload.addEventListener("complete", completeloading);
	preload.loadManifest([
		{id:"block", src:"blocks/blockPumpkin.jpg"},
		{id:"paddle", src:"paddles/paddlePencil.jpg"},
		{id:"brick0", src:"bricks/brick0.jpg"},
		{id:"brick1", src:"bricks/brick1.jpg"},
		{id:"brick2", src:"bricks/brick2.jpg"},
		{id:"brick3", src:"bricks/brick3.jpg"},
		{id:"brick4", src:"bricks/brick4.jpg"},
		{id:"brick5", src:"bricks/brick5.jpg"},
		{id:"brick6", src:"bricks/brick6.jpg"},
		{id:"brick7", src:"bricks/brick7.jpg"},
		{id:"brick8", src:"bricks/brick8.jpg"},
		{id:"brick9", src:"bricks/brick9.jpg"},
		{id:"brick10", src:"bricks/brick10.jpg"},
		{id:"brick11", src:"bricks/brick11.jpg"},
		{id:"brick12", src:"bricks/brick12.jpg"}	
	])
}

function updateloading(){
	messenger.text = "Loading: " + (preload.progress * 100 | 0) + "%";
	stage.update(); 
}

function completeloading(){
	messenger.text = "Welcome, click to play"
	stage.update();
	canvas.onclick = handleclick;
}

function handleclick(){
	canvas.onclick = null; 
	stage.removeChild(messenger);
	start();	
}

function close_modal(){
	if(username != "" && username != null){
		modal.style.display = "none";
	}
}

function handleenter(event){
	event.preventDefault();
	if(event.keyCode == 13 && input.value!= null && input.value != ""){
		username = input.value; 
		console.log(username);
		close_modal();
		document.onkeydown = handleKeyDown;
		document.onkeyup = handleKeyUp;
	}
}

function init(){

	canvas = document.getElementById('brickbreaker');
	scoreboard = document.getElementById('scoreboard');
	input  = document.getElementById('input');
	modal  = document.getElementById('modal');
	modal_close = document.getElementById('close');
	modal_close.onclick = close_modal;
	url = document.URL;
	highscore_url = url.slice(0, url.length-1)+"_server/highScore";
	submit_url = url.slice(0, url.length-1)+"_server/submitScore";
	highscore(function(data){
		scores = data.score;
		updatescoreboard_text();
	})

	console.log(highscore_url);
	input.addEventListener("keyup", handleenter);

	stage = new createjs.Stage(canvas);
	scorestage = new createjs.Stage(scoreboard);

	messenger = new createjs.Text("Loading", "bold 24px Arial", "#000000");
	messenger.maxWidth = 600;
	messenger.textAlign = "center";
	messenger.textBaseline = "middle";
	messenger.x = canvas.width / 2;
	messenger.y = canvas.height/ 2 -2;0
	stage.addChild(messenger);
	stage.update();

	load();
}

function updatescoreboard_text(){
	//this only updates the text file of the scoreboard: 
	if(scores == []){
		return;
	}
	scoreboard_text = [];
	var field = new createjs.Text("Scoreboard", "bold 18px Arial","#000000");
	field.textAlign = "center"
	field.x = 300;
	field.y = 20;
	field.maxWidth = 1000;
	scoreboard_text.push(field);

	for(var i=0; i<scores.length; i++){
		var str= (i+1)+". " + unescape(scores[i].name) 
				+ "--------------------------------------------------------" 
				+scores[i].score.toString();
		var field= new createjs.Text(str, "bold 18px Arial", "#000000");
		field.textAlign = "center"
		field.x = 300;
		field.y = scoreboard_text.length * 20 + 40;
		field.maxWidth = 1000;
		scoreboard_text.push(field);
	}
	console.log(scores)
	console.log(scoreboard_text)
	updatescoreboard_stage();
}

function updatescoreboard_stage(){
	scorestage.removeAllChildren();
	for(var i=0; i<scoreboard_text.length; i++){
		scorestage.addChild(scoreboard_text[i]);
	}
	scorestage.update();
}

function start(){
	// submit the last score
	
	if(score > 2000){
		submitscore(score, function(err){
			submitted = true;
			if(!err){
				console.log("submit was good");
			}
		})
	}
	// reset some variables 
	difficulty = 0; 
	vel = 2
	velx= 2
	vely = -2
	alive = true;
	score = 0;
	bricks = [];
	submitted = false;
	highscore(function(data){
		scores = data.score;
		updatescoreboard_text();
	})

	// start putting things into the frame 

	scoreField = new createjs.Text(score.toString(), "bold 18px Arial", "#000000");
	scoreField.textAlign = "right";
	scoreField.x = canvas.width - 20;
	scoreField.y = 20;
	scoreField.maxWidth = 1000;
	stage.addChild(scoreField)

	levelField = new createjs.Text(difficulty.toString(), "bold 18px Arial", "#000000");
	levelField.textAlign = "left";
	levelField.x = 20;
	levelField.y = 20;
	levelField.maxWidth = 1000;
	stage.addChild(levelField);

	var blockimg = preload.getResult('block');
	var blockbit = new createjs.Bitmap(blockimg);
	block = new createjs.Container();
	block.addChild(blockbit);
	stage.addChild(block);

	block.x = 300; 
	block.y = 500;
	
	var paddleimg = preload.getResult('paddle');
	var paddlebit = new createjs.Bitmap(paddleimg);
	paddle = new createjs.Container();
	paddle.addChild(paddlebit);
	stage.addChild(paddle);
	console.log(paddle.getBounds())

	paddle.x = 300; 
	paddle.y = 550;

	loadbricks(difficulty*10 + 10);
	stage.update();

	//start the game timer 
	if(!createjs.Ticker.hasEventListener("tick"))
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);
}

function loadbricks(numofbricks){
	var min = numofbricks -5;
	numofbricks = Math.floor(Math.random()*10)+min; 

	for(var i=0; i<numofbricks; i++){
		var brickadd = 'brick' + i%13;

		var brickimg = preload.getResult(brickadd);
		var brickbit = new createjs.Bitmap(brickimg);
		brick = new createjs.Container();
		brick.addChild(brickbit);

		brick.x = Math.floor(Math.random()*550);
		brick.y = Math.floor(Math.random()*400);

		bricks.push(brick);
		stage.addChild(bricks[bricks.length-1]);
	}
}
function tick(event){

	var width = canvas.width; 
	var height = canvas.height;

	//move the block;
	if(block.x >= 580){velx = -vel};
	if(block.x <= 0){velx = vel};
	if(block.y <= 0){vely = vel};
	if(collision(block, paddle)){
		vely = -vel;
	}
	if(block.y >= 580){gameover()}

	block.x += event.delta/1000*velx*100;
	block.y += event.delta/1000*vely*100;

	// moving the paddle 
	if(alive && lhold && paddle.x > 0){
		paddle.x -= event.delta/1000*vel*200;
	}
	if(alive && rhold && paddle.x < 525){
		paddle.x += event.delta/1000*vel*200;
	}

	//hitting a brick
	for(var i =0; i<bricks.length; i++){
		if(collision(block, bricks[i])){
			vely = -vely;
			score += 100;
			updatescore();
			stage.removeChild(bricks[i]);
			bricks.splice(i,1);
			if(bricks.length == 0){
				difficulty += 1;
				vel += 1;
				velx = vel;
				vely = -vel;
				updatelevel();
				// load new bricks.
				loadbricks(difficulty*10 + 10);
			}
			break;
		}
	}
	
	stage.update(event);
}

function gameover(){

	stage.removeAllChildren();
	messenger.text = "Game Over\nYou died on level " + difficulty 
	messenger.text += "\nScore: " + score + "\nClick to play again";
	stage.addChild(messenger);
	canvas.onclick = handleclick;
	stage.update();
	


}

function updatescore(){
	console.log(score);
	scoreField.text = score.toString();
	//stage.update();
}

function updatelevel(){
	console.log(difficulty);
	levelField.text = "Level: " + difficulty.toString();
	//stage.update();

}

function handleKeyDown(event){
	if(!event){
		var event = window.event;
	}
	switch(event.keyCode){
		case KEYCODE_A:
		case KEYCODE_LEFT:
			lhold = true;
			return false;
		case KEYCODE_D:
		case KEYCODE_RIGHT:
			rhold = true;
			return false;
	}
}

function handleKeyUp(event){
	if(!event){
		var event = window.event;
	}
	switch(event.keyCode){
		case KEYCODE_A:
		case KEYCODE_LEFT:
			lhold = false;
			break;
		case KEYCODE_D:
		case KEYCODE_RIGHT:
			rhold = false;
			break;
	}
}
///TODO: do this

function collision(obja, objb){
	obja_xmin = obja.x; 
	obja_xmax = obja.x + obja.getBounds().width; 
	objb_xmin = objb.x; 
	objb_xmax = objb.x + objb.getBounds().width;

	if(	(obja_xmin < objb_xmin && obja_xmax < objb_xmin) || 
		(obja_xmax > objb_xmax && obja_xmin > objb_xmax)){
		
		return false;
	}
	obja_ymin = obja.y; 
	obja_ymay = obja.y + obja.getBounds().height; 
	objb_ymin = objb.y; 
	objb_ymay = objb.y + objb.getBounds().height;

	if(	(obja_ymin < objb_ymin && obja_ymay < objb_ymin) || 
		(obja_ymay > objb_ymay && obja_ymin > objb_ymay)){
		
		return false;
	}
	return true;
}
