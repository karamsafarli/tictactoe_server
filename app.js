const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors')

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: '*'
    },
})

let connectedUsers = [];
let opponentName = '';
let myturn;


app.use(cors());

app.get('/', (req, res) => {
    res.send('salam')
})

io.on('connection', (socket) => {
    console.log("user connected", socket.id)
    socket.on('connected-user', (data) => {
        console.log(data)
    });

    socket.on('generate-room', ({ roomID, username, isMyTurn }) => {
        socket.join(roomID);
        opponentName = username;
        myturn = isMyTurn;
    });

    socket.on('join-room', ({ roomID, username }) => {
        console.log(opponentName, myturn)
        socket.join(roomID);
        socket.to(roomID).emit('opponent-name', username);
        let isMyTurn = !myturn;
        io.to(roomID).emit('joined-friend-room', { opponentName, isMyTurn });
    });

    socket.on('user-played', ({ idx, roomID }) => {
        socket.broadcast.to(roomID).emit('play-changes', idx);
    })
});

server.listen(process.env.PORT || 3001, '0.0.0.0', () => {
    console.log('Server is listening...')
})