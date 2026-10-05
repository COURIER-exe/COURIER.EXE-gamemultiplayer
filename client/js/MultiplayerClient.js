const CLIENT_ID_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TOPIC_PREFIX = "courier";

function generateClientId() {
  let id = "";
  for (let index = 0; index < 4; index++) {
    id +=
      CLIENT_ID_LETTERS[Math.floor(Math.random() * CLIENT_ID_LETTERS.length)];
  }
  return id;
}

export class MultiplayerClient {
  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.brokerUrl = `${protocol}//${window.location.host}/mqtt`;
    this.topicPrefix = TOPIC_PREFIX;
    this.clientId = generateClientId();
    this.playerId = this.clientId;
    this.client = null;
    this.listeners = new Map();
    this.pendingMessages = [];
    this.connected = false;
    this.hasConnected = false;
    this.connect();
  }

  connect() {
    if (this.client) return;
    this.client = window.mqtt.connect(this.brokerUrl, {
      clientId: this.clientId,
      clean: true,
      reconnectPeriod: 1000,
    });

    this.client.on("connect", () => {
      this.subscribe(`client/${this.clientId}`, (error) => {
        if (error) return;
        this.connected = true;
        this.hasConnected = true;
        this.pendingMessages.splice(0).forEach(({ topic, data }) => {
          this.publish(topic, data);
        });
        this.emit("connect");
      });
    });
    this.client.on("message", (topic, payload) => {
      let data;
      try {
        data = JSON.parse(payload.toString());
      } catch {
        data = payload.toString();
      }

      const prefix = `${this.topicPrefix}/`;
      const shortTopic = topic.startsWith(prefix)
        ? topic.slice(prefix.length)
        : topic;
      this.emit("message", shortTopic, data);
      this.emit(`message:${shortTopic}`, data);
      if (data?.type === "connected") this.playerId = data.playerId;
      if (data?.type) this.emit(data.type, data);
    });
    this.client.on("error", (error) => {
      console.error("MQTT client error:", error);
      this.emit("error", error);
    });
    this.client.on("close", () => {
      this.connected = false;
      this.emit("close");
    });
  }

  on(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
    return () => this.listeners.get(type)?.delete(listener);
  }

  emit(type, ...args) {
    this.listeners.get(type)?.forEach((listener) => listener(...args));
  }

  subscribe(topic, callback) {
    const fullTopic = `${this.topicPrefix}/${topic}`;
    this.client?.subscribe(fullTopic, { qos: 0 }, (error) => {
      if (error) {
        console.error(`Failed to subscribe to topic "${fullTopic}":`, error);
        this.emit("error", error);
      }
      callback?.(error);
    });
  }

  send(type, data = {}) {
    const message =
      typeof data === "object" && data !== null
        ? { ...data, type, clientId: this.clientId }
        : { type, data, clientId: this.clientId };
    return this.publish("server", message);
  }

  publish(topic, data) {
    if (!this.client) return false;
    if (!this.connected) {
      if (!this.hasConnected) {
        this.pendingMessages.push({ topic, data });
        return true;
      }
      return false;
    }

    const fullTopic = `${this.topicPrefix}/${topic}`;
    const envelope =
      typeof data === "object" && data !== null
        ? { ...data, clientId: this.clientId }
        : { data, clientId: this.clientId };
    this.client.publish(fullTopic, JSON.stringify(envelope), { qos: 0 });
    return true;
  }

  disconnect() {
    this.client?.end();
    this.client = null;
    this.connected = false;
    this.listeners.clear();
  }

  close() {
    this.disconnect();
  }
}
