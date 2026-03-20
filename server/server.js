const http = require("http");
const { Server } = require("socket.io");
const Y = require("yjs");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" },
});

const docs = new Map();

io.on("connection", (socket) => {
  socket.on("join-document", (docId) => {
    socket.join(docId);

    if (!docs.has(docId)) {
      docs.set(docId, new Y.Doc());
    }
    const ydoc = docs.get(docId);

    
    const state = Y.encodeStateAsUpdate(ydoc);
    socket.emit("sync", state);

    socket.on("sync", (update) => {
      const binaryUpdate = new Uint8Array(update);
     
      Y.applyUpdate(ydoc, binaryUpdate, "server");
     
      socket.to(docId).emit("sync", binaryUpdate);
    });
  });
});

server.listen(5000);