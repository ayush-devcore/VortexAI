let io = null;

function setIO(socketIO) {
  io = socketIO;
}

function getIO() {
  return io;
}

function emitToWorkspace(workspaceId, event, data) {
  if (io) io.to(`workspace:${workspaceId}`).emit(event, data);
}

module.exports = { setIO, getIO, emitToWorkspace };
