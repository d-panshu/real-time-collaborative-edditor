const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:"*",
    },
});

let documentContent = "";

io.on("connection", (socket)=>{
    console.log("a user connected", socket.id);

    socket.emit("load-document", documentContent);

    socket.on("sent-changes",(delta)=>{
        documentContent = delta;
        socket.broadcast.emit("receive-changes", delta);
    });


    socket.on("disconnect", ()=>{
        console.log("user disconnected", socket.id);
    });

});

server.listen(5000, ()=>{
    console.log("listening on:5000");
    
})