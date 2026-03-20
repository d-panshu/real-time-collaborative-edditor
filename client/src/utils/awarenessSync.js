import {
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";
import { socket } from "../socket/socket.js";

export const setupAwareness = (awareness) => {
  const handleUpdate = ({ added, updated, removed }) => {
    const changed = added.concat(updated).concat(removed);
    const update = encodeAwarenessUpdate(awareness, changed);
    socket.emit("awareness-update", update);
  };

  awareness.on("update", handleUpdate);

  const receive = (update) => {
    applyAwarenessUpdate(awareness, new Uint8Array(update), "socket");
  };

  socket.on("awareness-update", receive);

  return () => {
    socket.off("awareness-update", receive);
  };
};