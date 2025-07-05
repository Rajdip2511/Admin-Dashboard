import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(URL, {
      autoConnect: false,
    });
  }

  connect(user: any) {
    this.socket.io.opts.query = { userId: user.id };
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const socketService = new SocketService(); 