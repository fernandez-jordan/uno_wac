var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require('ejs');
var express = require("express");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
var expressJsonApi = require('express-json-api');
var get = expressJsonApi.controllers.get;
var getList = expressJsonApi.controllers.getList;
var patch = expressJsonApi.controllers.patch;
var post = expressJsonApi.controllers.post;
// var http = require('http');
// var fs = require('fs');

http.listen(3000, function(){
  // console.log('listening on *:3000');
});

app.get('/', function(req, res) {
	res.render('index');
});

var io = require('socket.io').listen(8080);
var count = 0;
var index = 0;
var clients = [];
var main_1;
var main_2;
var main_3;
var main_4;
var player_start;
var current_player;
var deks_full = [];
var deks_full_copy;
var dek_cut;
var first_pioche;
var played = [];
var was_played = [];
var j = 1;
deks_full = createdek(deks_full);
deks_full_copy = deks_full;

// Génération du paquet et de sa copie

function createdek(createdek) {

	var couleurs = Array("bleu", "vert", "jaune", "rouge");
	var i = 1;
	couleurs.forEach( function(element, index) {
		while (i < 10) {
			if (i === 1) {
				deks_full.push(element + "_" + i);
			}
			else {
				deks_full.push(element + "_" + i);
				deks_full.push(element + "_" + i);            
			}
			i++;
		}
		deks_full.push(element + "_+2");
		deks_full.push(element + "_+2");
		deks_full.push(element + "_inverse");
		deks_full.push(element + "_inverse");
		deks_full.push(element + "_skip");
		deks_full.push(element + "_skip");
		i = 1;
	});
	deks_full.push("joker_joker");
	deks_full.push("joker_joker");
	deks_full.push("joker_joker");
	deks_full.push("joker_joker");
	deks_full.push("neutre_+4");
	deks_full.push("neutre_+4");
	deks_full.push("neutre_+4");
	deks_full.push("neutre_+4");

	return deks_full;
}

io.on('connection', function(socket){
	count++;
	if (clients.length == 0)
		player_start = socket.id;
	clients.push(socket.id);
	var id = socket.id;
	socket.on('disconnect', function(){
		count--;
		var index = clients.indexOf(socket);
		if (index != -1) {
			clients.splice(index, 1);
		}
	});

	socket.on('message', function (message) {
		var numb = 0;
		var rand = [];
		while (numb !== count) {
			rand.push([]);
			numb++;
		}
		pull_deck(rand);
	});	

	function pull_deck(rand)
	{
		for (var ie = 0; ie < count ; ie++) {
			for (var i = 0; i < 7; i++) {
				var random = Math.floor(Math.random() * deks_full.length);
				rand[ie].push(deks_full[random]);
				deks_full.splice(random,1);
			}
			index++;
		}
		dek_cut = deks_full;

		io.to(clients[0]).emit('message', rand[0])
		io.to(clients[1]).emit('message', rand[1])
		io.to(clients[2]).emit('message', rand[2])
		io.to(clients[3]).emit('message', rand[3])

		main_1 = rand[0];
		main_2 = rand[1];
		main_3 = rand[2];
		main_4 = rand[3];


		io.to(clients[0]).emit('players', "joueur 1")
		io.to(clients[1]).emit('players', "joueur 2")
		io.to(clients[2]).emit('players', "joueur 3")
		io.to(clients[3]).emit('players', "joueur 4")
	}

	socket.on('tour', function (message) {
		if(id == player_start){
			var random_pioche = dek_cut.splice(Math.random() * dek_cut.length | 0, 1)[0];
			first_pioche = random_pioche;
			io.emit('pioche', random_pioche)
		}
	});	

	socket.on('get_card', function (get_card) {
		if(clients[0] == socket.id){
			var random_pioche_1 = dek_cut.splice(Math.random() * dek_cut.length | 0, 1)[0];
			main_1.push(random_pioche_1);
			io.to(clients[0]).emit('card_pull',random_pioche_1);
		}
		if(clients[1] == socket.id){
			var random_pioche_2 = dek_cut.splice(Math.random() * dek_cut.length | 0, 1)[0];
			main_2.push(random_pioche_2);
			io.to(clients[1]).emit('card_pull',random_pioche_2);
		}
		if(clients[2] == socket.id){
			var random_pioche_3 = dek_cut.splice(Math.random() * dek_cut.length | 0, 1)[0];
			main_3.push(random_pioche_3);
			io.to(clients[2]).emit('card_pull',random_pioche_3);
		}
		if(clients[3] == socket.id){
			var random_pioche_4 = dek_cut.splice(Math.random() * dek_cut.length | 0, 1)[0];
			main_4.push(random_pioche_4);
			io.to(clients[3]).emit('card_pull',random_pioche_4);
		}
	});	

	socket.on('card_play', function (card_play,contentPanelId) {
		if (j == 1){
			if(clients[1] == socket.id){
				if (main_2.indexOf(card_play) >= 0) {
					played.push(card_play.split("_"));
					was_played.push(first_pioche.split("_"));
					if(played[0][0] == was_played[0][0] || played[0][1] == was_played[0][1] ||
						played[0][1] == "+4" || played[0][1] == "joker")
					{
						j = "2";
						dek_cut.splice(0, 0,card_play);
						io.to(clients[0]).emit('card_accept', dek_cut[0]);
						io.to(clients[1]).emit('card_accept', dek_cut[0]);
						io.to(clients[2]).emit('card_accept',  dek_cut[0]);
						io.to(clients[3]).emit('card_accept', dek_cut[0]);
						
						io.to(clients[1]).emit('card_accept_1', contentPanelId);
					}
					else {
						io.to(clients[1]).emit('card_denied', "carte non correct, jouer autre chose");
					}
				}

			}
		}
		if (j == "2"){
			if(clients[2] == socket.id){
				if (main_3.indexOf(card_play) >= 0) {
					played.push(card_play.split("_"));
					was_played.push(dek_cut[0].split("_"));
					if(played[1][0] == was_played[0][0] || played[1][1] == was_played[1][1] ||
						played[0][1] == "+4" || played[0][1] == "joker")
					{
						j = 3;
						dek_cut.splice(0, 0,card_play);
						io.to(clients[0]).emit('card_accept', dek_cut[0]);
						io.to(clients[1]).emit('card_accept', dek_cut[0]);
						io.to(clients[2]).emit('card_accept', dek_cut[0]);
						io.to(clients[3]).emit('card_accept', dek_cut[0]);

						io.to(clients[2]).emit('card_accept_1', contentPanelId);

					}
					else {
						io.to(clients[2]).emit('card_denied', "carte non correct, jouer autre chose");
					}
				}

			}
		}
		if (j == "3"){
			if(clients[3] == socket.id){
				if (main_4.indexOf(card_play) >= 0) {
					played.push(card_play.split("_"));
					was_played.push(dek_cut[0].split("_"));
					if(played[1][0] == was_played[0][0] || played[1][1] == was_played[1][1] ||
						played[0][1] == "+4" || played[0][1] == "joker")
					{
						j = 4;
						dek_cut.splice(0, 0,card_play);
						io.to(clients[0]).emit('card_accept', dek_cut[0]);
						io.to(clients[1]).emit('card_accept', dek_cut[0]);
						io.to(clients[2]).emit('card_accept', dek_cut[0]);
						io.to(clients[3]).emit('card_accept', dek_cut[0]);

						io.to(clients[3]).emit('card_accept_1', contentPanelId);

					}
					else {
						io.to(clients[0]).emit('card_denied', "carte non correct, jouer autre chose");
					}
				}

			}
		}
		if (j == "4"){
			if(clients[0] == socket.id){
				if (main_1.indexOf(card_play) >= 0) {
					played.push(card_play.split("_"));
					was_played.push(dek_cut[0].split("_"));
					if(played[1][0] == was_played[0][0] || played[1][1] == was_played[1][1] ||
						played[0][1] == "+4" || played[0][1] == "joker")
					{
						j = 1;
						dek_cut.splice(0, 0,card_play);
						io.to(clients[0]).emit('card_accept', dek_cut[0]);
						io.to(clients[1]).emit('card_accept', dek_cut[0]);
						io.to(clients[2]).emit('card_accept', dek_cut[0]);
						io.to(clients[3]).emit('card_accept', dek_cut[0]);

						io.to(clients[0]).emit('card_accept_1', contentPanelId);

					}
					else {
						io.to(clients[0]).emit('card_denied', "carte non correct, jouer autre chose");
					}
				}

			}
		}
	});	
});
