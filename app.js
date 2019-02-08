const Koa = require('koa');
const app = new Koa();
const http = require('http').Server(app.callback());
const io = require('socket.io')(http);
const views = require('koa-views');
const path = require('path');
const serve = require('koa-static');
const Player = require("./Player.js");

app
	.use(views(path.join('frontend'), {extension: 'html'}))
	.use(serve('frontend'));

app.use(async ctx => {
	await ctx.render("index.html");
})

const players = [];
let total = 0;
let history = "0";
const goal = Math.floor(Math.random()*50) + 10;

io.on('connection', function(socket){

	if (players.length >= 2) {
		io.emit('no space', {message: "Not enough space go home"});
	}

	socket.on('user name', function(data) {
		if (players.length < 2) {
			const player = new Player(socket.id, players.length === 1 ? "red" : "blue", data.name);
			players.push(player);

			console.log(players);

			if (players.length === 2) {
				io.emit('start game', {goal: goal});
				io.sockets.sockets[players[0].id].emit('your turn', {color: players[0].color});
			}
		}
	});

	socket.on('user step', function(data) {
		history += data;
		total = eval(total + data);

		const player = players.filter(player => player.id === socket.id)[0];
		if (total >= goal) {
			return io.emit('game over', {winner: player.name});
		}

		io.emit('result', {total: total, history: history, color:player.color, step: data});
		socket.broadcast.emit('your turn', {armen: "armen"});
	})
});



http.listen(3000);
