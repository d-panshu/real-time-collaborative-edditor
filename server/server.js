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
    socket.docId = docId;

    if (!docs.has(docId)) {
      docs.set(docId, new Y.Doc());
    }

    const ydoc = docs.get(docId);

    const state = Y.encodeStateAsUpdate(ydoc);
    socket.emit("sync", state);
  });

  socket.on("sync", (update) => {
    const docId = socket.docId;
    if (!docId) return;

    const ydoc = docs.get(docId);

    const binary = new Uint8Array(update);
    Y.applyUpdate(ydoc, binary, "server");

    socket.to(docId).emit("sync", binary);
  });

  socket.on("awareness-update", (update) => {
    const docId = socket.docId;
    if (!docId) return;

    socket.to(docId).emit("awareness-update", update);
  });
});

server.listen(5000, () => console.log("Server running on 5000"));