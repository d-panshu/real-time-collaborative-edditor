export const setupCursors = (quill, awareness, ydoc) => {
  const cursors = quill.getModule("cursors");

  const updateCursors = () => {
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
  };

  awareness.on("update", updateCursors);

  return () => {
    awareness.off("update", updateCursors);
  };
};