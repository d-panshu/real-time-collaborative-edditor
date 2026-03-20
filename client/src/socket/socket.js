import { io } from "socket.io-client";

const URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

export const socket = io(URL);