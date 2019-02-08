const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
canvas.width = $(window).width()- 30;
canvas.height = 250;

const backImage = new Image();
backImage.src = 'https://chupacdn.s3.amazonaws.com/catalog/product/cache/1/thumbnail/1280x/17f82f742ffe127f42dca9de82fb58b1/1/2/12-vector-game-backgrounds-8320_imgs_8320_4.png' ;

const hero1 = new Image();
hero1.src = 'images/ninja.png';

const hero2 = new Image();
hero2.src= 'images/ninja.png';

const finish = new Image();
finish.src='https://cdn0.iconfinder.com/data/icons/sports-solid-icons-3/48/110-512.png';


const gameData = {
	hero: {
		x: 20,
		y: canvas.height-90,
		img: hero1,
		width: 80,
		height: 80,
		color: "red"
	},
	finish:{
		x:canvas.width-100,
		y: canvas.height-100,
		img:finish,
		width: 100,
		height: 100
	},
	hero2: {
		x: 20,
		y: canvas.height-80,
		img: hero2,
		width: 80,
		height: 80,
		color: "blue"
	}
};

const drawhero = function() {
	context.clearRect(0,0, canvas.width, canvas.height);
	context.drawImage(backImage, 0, 0, canvas.width, canvas.height);
	const hero = gameData.hero;
	const finish=gameData.finish;
	const hero2 =gameData.hero2;

	context.drawImage(hero.img, hero.x, hero.y, hero.width, hero.height);
	context.drawImage(finish.img,finish.x,finish.y,finish.width,finish.height)
	context.drawImage(hero2.img, hero2.x, hero2.y, hero2.width, hero2.height);
};

const disableButtons = function(){
	$(".button").addClass('disabled').attr('disabled', true);
	myTurn = false;
};


const socket = io();

let number = 0;
let history = '';
let goal = 0;
let myTurn = false;
let sendValue = "no";
let minusCount = 3;

socket.on('no space', data => {
	document.getElementById('sorry').style.display = "block";
});

socket.on('result', data =>{
	const hero1=gameData.hero;
	const hero2=gameData.hero2;
	if(data.color===hero1.color){
		hero1.x=hero2.x+((canvas.width-40)/goal)*parseInt(data.step[1]) * (data.step[0] === '+' ? 1  : -1);
	} else {
		hero2.x=hero1.x+((canvas.width-40)/goal)*parseInt(data.step[1]) * (data.step[0] === '+' ? 1  : -1);
	}
	drawhero();
	history += '<label style="color:'+ data.color +';">' + data.history.substring(data.history.length-2) + "</label><a>";
	let historyArr = history.split('<a>');
	if (historyArr.length > 6) {
		historyArr = historyArr.splice(historyArr.length-6, 6);
		history = historyArr.join('<a>');
		console.log(history);
	}
	$("#history").html(history);
	$("#total").text(data.total);
});


socket.on('start game', function(data) {
	console.log("game started");
	goal = data.goal;
	$('#goal').html("<b>"+ data.goal +"</b>");
	$('.game-components').removeClass('invisible');
	$('#wait').addClass('invisible');
});

socket.on('your turn', data => {
	$(".button").removeClass('disabled').attr('disabled', false);
	myTurn = true;
});

$('.button').click((e) => {
	$('.button').removeClass('active');
	$(e.target).addClass('active');
	sendValue = $(e.target).data('value');
});

$('#plus').click(e => {
	if (myTurn && sendValue !== 'no') {
		socket.emit('user step', "+" + sendValue);
		disableButtons();
	}
});

$('#minus').click(e => {
	if (myTurn && sendValue !== 'no' && minusCount > 0) {
		console.log("-" + sendValue);
		socket.emit('user step', "-" + sendValue);
		minusCount--;
		if (minusCount === 0) {
			$('#minus').addClass(disabled);
		}
		disableButtons();
	}
});

socket.on('game over', data => {
	$('.winnerWindow').removeClass('invisible');
	$('#winner').text(data.winner + " is the winner");
	document.getElementById('fatality').play();
});

$('#NameArea').change(e=> {
	$('#NameArea').attr('disabled', true);
	socket.emit('user name', {name: $('#NameArea').val()});
});

backImage.onload = drawhero;
hero1.onload = drawhero;
hero2.onload = drawhero;
finish.onload = drawhero;
