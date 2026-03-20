import React, { useEffect, useRef } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import * as Y from "yjs";
import { io } from "socket.io-client";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";

import "quill/dist/quill.snow.css";

Quill.register("modules/cursors", QuillCursors);

const socket = io("http://localhost:5000");

function Editor() {
  const editorRef = useRef(null);

  const ydoc = useRef(new Y.Doc()).current;
  const awareness = useRef(new Awareness(ydoc)).current;
  const ytext = ydoc.getText("quill");

  useEffect(() => {
    let isApplyingRemote = false;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: true,
        cursors: true,
      },
    });

    const cursors = quill.getModule("cursors");

    socket.emit("join-document", "doc-1");


    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user" || isApplyingRemote) return;

      ydoc.transact(() => {
        ytext.applyDelta(delta.ops);
      });
    });

    ytext.observe((event) => {
      if (!isApplyingRemote) return;

      const selection = quill.getSelection();

      quill.updateContents(event.delta, "silent");

      if (selection) {
        quill.setSelection(selection);
      }
    });

    ydoc.on("update", (update, origin) => {
      if (origin !== "socket") {
        socket.emit("sync", update);
      }
    });

    socket.on("sync", (update) => {
      isApplyingRemote = true;

      Y.applyUpdate(ydoc, new Uint8Array(update), "socket");

      isApplyingRemote = false;
    });

    awareness.on("update", ({ added, updated, removed }) => {
      const changed = added.concat(updated).concat(removed);
      const update = encodeAwarenessUpdate(awareness, changed);
      socket.emit("awareness-update", update);
    });

    socket.on("awareness-update", (update) => {
      applyAwarenessUpdate(awareness, new Uint8Array(update), "socket");
    });

    awareness.setLocalStateField("user", {
      name: "User " + Math.floor(Math.random() * 100),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    quill.on("selection-change", (range) => {
      if (range) {
        awareness.setLocalStateField("cursor", range);
      }
    });

    awareness.on("update", () => {
      cursors.clearCursors();

      awareness.getStates().forEach((state, clientId) => {
        if (clientId === ydoc.clientID) return;

        const user = state.user || {};
        const cursor = state.cursor;

        if (!cursor) return;

        cursors.createCursor(
          clientId.toString(),
          user.name || "User",
          user.color || "blue"
        );

        cursors.moveCursor(clientId.toString(), cursor);
      });
    });

    return () => {
      socket.off("sync");
      socket.off("awareness-update");
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Real-time Collaborative Editor</h2>
      <div
        ref={editorRef}
        style={{ height: "400px", border: "1px solid #ccc" }}
      />
    </div>
  );
}

export default Editor;