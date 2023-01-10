const app = require('express')();
const createServer = require("http").createServer(app);
const io = require("socket.io")(createServer)
let path = require('path');



//game state variables
let joueurs = []
let player = 0
let sel = [-1,-1]
let plateau = new Array(14)
let active = true






app.get('/', (req, res) => {
    res.sendFile('entrer.html', {root: path.join(__dirname, '../public')});
});

app.get('/game', (req, res) => {
    res.sendFile('clientHex2_0.html', {root: path.join(__dirname, '../public')});

});



app.use(`*`, (req, res) => {
    res.status(404).sendFile('404.html', {root: path.join(__dirname, '../public')});
}) // si un chemin n'existe pas on renvoie un message d'erreur personalisé



io.on('connection', (socket) => {

    socket.on('chat', (msg) => {
        io.emit("chat", msg)
    })
    socket.on('quitter', (data) => {
        joueurs.splice(joueurs.indexOf(data), 1)
        socket.emit("quitter", data)
        socket.broadcast.emit('endGame', data);
    })

    //listen to new game
    socket.on('newGame', () => {
        io.emit("newGame")
    })


    socket.on("yourTurn", (data) => {
        player = data.player
        sel = data.sel
        plateau = data.plateau
        active = data.active

        socket.broadcast.emit("yourTurn", data);
    });

    //listen to the onmousedown event
    socket.on('mouseDown', (data) => {
        io.emit("mouseDown", data)
    })
    socket.on("startGame",(data)=>{
        if (joueurs.length < 2 && joueurs.indexOf(data.name) === -1) {
            joueurs.push(data.name);
            io.emit("startGame",joueurs)
        }else {
            socket.emit("error_start","Le joueur est déjà dans la liste ou la liste est pleine")
        }
        if (joueurs.length === 2){
            io.emit('init')
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');

    });

});



createServer.listen(port = 5050, () => {
    console.log(`http://localhost:${port}`);
})