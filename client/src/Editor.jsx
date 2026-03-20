import React, { useEffect, useRef } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";

import { ydoc, ytext } from "./yjs/ydoc";
import { awareness, initUser } from "./yjs/awareness.js";
import { setupSync } from "./yjs/sync";
import { setupAwareness } from "./utils/awarenessSync";
import { setupCursors } from "./utils/cursor";

import "quill/dist/quill.snow.css";

Quill.register("modules/cursors", QuillCursors);

function Editor() {
  const editorRef = useRef(null);

  useEffect(() => {
    let isApplyingRemote = false;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: true,
        cursors: true,
      },
    });

    // init user
    initUser();

    // socket sync
    const cleanupSync = setupSync(ydoc);

    // awareness sync
    const cleanupAwareness = setupAwareness(awareness);

    // cursor UI
    const cleanupCursor = setupCursors(quill, awareness, ydoc);

    // LOCAL → YJS
    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user" || isApplyingRemote) return;

      ydoc.transact(() => {
        ytext.applyDelta(delta.ops);
      });
    });

    // YJS → UI
    ytext.observe((event) => {
      isApplyingRemote = true;

      const selection = quill.getSelection();

      quill.updateContents(event.delta, "silent");

      if (selection) quill.setSelection(selection);

      isApplyingRemote = false;
    });

    // cursor tracking
    quill.on("selection-change", (range) => {
      if (range) {
        awareness.setLocalStateField("cursor", range);
      }
    });

    return () => {
      cleanupSync();
      cleanupAwareness();
      cleanupCursor();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div
        ref={editorRef}
        style={{ height: "400px", border: "1px solid #ccc" }}
      />
    </div>
  );
}

export default Editor;