import { Awareness } from "y-protocols/awareness";
import { ydoc } from "./ydoc.js";

export const awareness = new Awareness(ydoc);

export const initUser = () => {
  awareness.setLocalStateField("user", {
    name: "User " + Math.floor(Math.random() * 100),
    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
  });
};