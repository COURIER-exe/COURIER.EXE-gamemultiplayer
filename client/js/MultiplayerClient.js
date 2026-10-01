export class MultiplayerClient {
  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    this.listeners = new Map();
    this.pendingMessages = [];
    this.playerId = null;

    this.socket.addEventListener("open", () => {
      this.pendingMessages.splice(0).forEach((message) => {
        this.socket.send(message);
      });
    });
    this.socket.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === "connected") this.playerId = message.playerId;
      this.listeners.get(message.type)?.forEach((listener) => listener(message));
    });
  }

  on(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
    return () => this.listeners.get(type)?.delete(listener);
  }

  send(type, data = {}) {
    const message = JSON.stringify({ type, ...data });
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      return true;
    }
    if (this.socket.readyState === WebSocket.CONNECTING) {
      this.pendingMessages.push(message);
      return true;
    }
    return false;
  }

  close() {
    this.socket.close();
    this.listeners.clear();
  }
}