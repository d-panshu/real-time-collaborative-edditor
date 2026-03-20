import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Editor() {
  const textareaRef = useRef(null);
  const ydocRef = useRef(new Y.Doc());

  useEffect(() => {
    const ydoc = ydocRef.current;
    const ytext = ydoc.getText("shared-text");

    socket.emit("join-document", "doc-1");

    ytext.observe(() => {
      if (textareaRef.current && textareaRef.current.value !== ytext.toString()) {
        textareaRef.current.value = ytext.toString();
      }
    });

    ydoc.on("update", (update, origin) => {
      if (origin !== "socket") {
        socket.emit("sync", update);
      }
    });

    socket.on("sync", (update) => {
      Y.applyUpdate(ydoc, new Uint8Array(update), "socket");
    });

    return () => {
      socket.off("sync");
    };
  }, []);

  const handleInput = (e) => {
    const ytext = ydocRef.current.getText("shared-text");
    const value = e.target.value;

    ydocRef.current.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, value);
    });
  };

  return (
    <textarea
      ref={textareaRef}
      onInput={handleInput}
      rows="20"
      cols="80"
    />
  );
}

export default Editor;