const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const luhn = require("luhn");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send(`<!doctype html>
	<html>
		<head>
			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<h1>Hello Smolny!</h1>
		</body>
	</html>`);
});

app.get('/error', (req, res) => {
	throw Error('Oops!');
});

//localhost:3000/transfer?amount=1000&from=Bill Johnson&to=Rustam Apaev
app.get('/transfer', (req, res) => {
	const {amount, from, to} = req.query;
	res.json({
		result: 'success',
		amount,
		from,
		to
	});
});

app.get('/cards', (req, res) => {
	fs.readFile('./source/cards.json', 'utf8', function(err, contents) {
        if (err) {
            res.statusCode= 500;
            res.end("Ошибка чтения файла: " + err);
            return console.error(err);
         }
        else {
            res.statusCode= 200;
            res.json(JSON.parse(contents));
        }
	});
});

app.post('/cards', (req, res) => {
    fs.readFile('./source/cards.json', 'utf8', function(err, contents) {
        if (err) {
            res.statusCode= 500;
            res.end("Ошибка при чтении файла: " + err);
            return console.error(err);
         }
        else {
            var cards = JSON.parse(contents);
            var balance = req.body.balance;
            var cardNumber = req.body.cardNumber;

            var isValid = luhn.validate(cardNumber);

            if(isValid){
                var id = cards.length.toString();
                var newCard = { id, cardNumber, balance };
                cards.push(newCard);
                fs.writeFile('./source/cards.json', JSON.stringify(cards),  function(err) {
                    if (err) {
                        res.statusCode= 500;
                        res.end("Ошибка при записи файла: " + err);
                        return console.error(err);
                    }
                    else {
                        res.statusCode= 200;
                        res.json(newCard)
                    }
                });
            }
            else{
                res.statusCode = 400;
                res.end("Card number is not valid (by Luhn test)")
            }
        }
    })
})

app.delete('/cards/:id', (req, res) => {
    fs.readFile('./source/cards.json', 'utf8', function(err, contents) {
        if (err) {
            res.statusCode= 500;
            res.end("Ошибка при чтении файла: " + err);
            return console.error(err);
         }
        else {
            var cards = JSON.parse(contents);
            var newCards = cards.filter(function (elem){
                return elem.id != req.params.id
            })

            if( newCards.length != cards.length ){

                fs.writeFile('./source/cards.json', JSON.stringify(newCards),  function(err) {
                    if (err) {
                        res.statusCode= 500;
                        res.end("Ошибка при записи файла: " + err);
                        return console.error(err);
                    }
                    else {
                        res.statusCode= 200;
                        res.end(`Была удалена карта с id=${req.params.id}`)
                    }
                });
            }

            else {
                res.statusCode= 404;
                res.end(`card with id ${req.params.id} not found`)
            }
        }
    })
})


app.listen(3000, () => {
	console.log('YM Node School App listening on port 3000!');
});

// синхронные функции по работе с файловой системой

/* function readCards(){
	var cardsText = fs.readFileSync('./source/cards.json').toString();
	var cards = []
	cards = JSON.parse(cardsText);
	return cards
}

function writeCards(cards){
	fs.writeFileSync('./source/cards2.json', JSON.stringify(cards))
} */


/*
// не требовалось , синхронно
app.get('/cards/:id', (req, res) => {
	var cards = readCards();
	var card = cards.find(function (elem){
		return elem.id == req.params.id
	})
	if(card){
		res.json(card)
	}
	else {
        res.statusCode= 404;
        res.end(`card with id ${req.params.id} not found`);
	}

}); */

// синхронные методы - переделать
/* app.delete('/cards/:id', (req, res) => {
    var cards = readCards();

    var newCards = cards.filter(function (elem){
        return elem.id != req.params.id
    })

    if(newCards.length != cards.length){
        res.statusCode= 200;
        res.json({newCardsLength: newCards.length , cardsLength: cards.length})
        writeCards(newCards)
    }

    else {
        res.statusCode= 404;
        res.end(`card with id ${req.params.id} not found`)
    }
});

app.post('/cards', (req, res) => {

	var balance = req.body.balance;
	var cardNumber = req.body.cardNumber;

	// операции с картами
	var cards = readCards();
	var id = cards.length.toString();
	var newCard = { id, cardNumber, balance };
	cards.push(newCard);
	writeCards(cards);

	// ответ сервера

	res.end(`added new card ${JSON.stringify(newCard)}`)

}); */
