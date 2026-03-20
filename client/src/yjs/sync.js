import * as Y from "yjs";
import { socket } from "../socket/socket.js";

export const setupSync = (ydoc) => {
  socket.emit("join-document", "doc-1");

  // send updates
  ydoc.on("update", (update, origin) => {
    if (origin !== "socket") {
      socket.emit("sync", update);
    }
  });

  // receive updates
  const handleSync = (update) => {
    Y.applyUpdate(ydoc, new Uint8Array(update), "socket");
  };

  socket.on("sync", handleSync);

  return () => {
    socket.off("sync", handleSync);
  };
};