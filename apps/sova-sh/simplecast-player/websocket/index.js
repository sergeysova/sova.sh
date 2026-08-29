let socket = {
  onClose(event) {
    console.log('Connection closed: ', event);

    this.ready = false;
    this.reconnectSocket();
  },
  onError(event) {
    console.log('Connection error: ', event);

    this.ready = false;
    this.reconnectSocket();
  },
  onMessage(event) {
    // console.log('Message from server: ', event.data)
  },
  onOpen(event) {
    // console.log('Connection opened')
    this.ready = true;

    this.sendQueue();
  },
  open() {
    if (process.env.WEBSOCKET_PATH && process.env.WEBSOCKET_PATH !== '') {
      this.websocketPath = process.env.WEBSOCKET_PATH;
    }

    console.log('opening socket');

    if (!this.websocketPath || this.websocketPath === '') {
      console.log('no path');

      return;
    }

    try {
      this.ws = new WebSocket(this.websocketPath);

      // Connection Error
      this.ws.addEventListener('error', (event) => {
        socket.onError(event);
      });

      // Connection Close
      this.ws.addEventListener('close', (event) => {
        socket.onClose(event);
      });

      // Connection Opened
      this.ws.addEventListener('open', (event) => {
        socket.onOpen(event);
      });

      // Messages
      this.ws.addEventListener('message', (event) => {
        socket.onMessage(event);
      });
    } catch (err) {
      console.log(err);
      this.ws = {
        send(data) {},
      };

      console.log('no path');
    }
  },
  reconnectSocket() {
    clearTimeout(this.timeout);
    this.timeout = false;
    this.timeout = setTimeout(() => {
      if (this.ready) return true;

      this.open(this.websocketPath);
    }, 10000);
  },
  send(msg) {
    // console.log('Send: ', msg)

    if (!this.ready) {
      this.open();
      return this.stashQueue(msg);
    }

    this.ws.send(JSON.stringify(msg));
  },
  sendQueue() {
    // console.log('Send queue: ', this.queue)

    if (this.queue.length <= 0) return;

    this.send(this.queue.shift());
    this.sendQueue();
  },
  stashQueue(msg) {
    // console.log('Stash queue: ', msg)

    this.queue.push(msg);

    return false;
  },
  ready: false,
  queue: [],
  websocketPath: false,
};

export default socket;
