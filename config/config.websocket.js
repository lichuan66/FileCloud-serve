const WebSocket = require("ws");
const qs = require("querystring");

class Ws {
  online = 0;
  ws = WebSocket.Server;
  client = null;
  init() {
    this.ws = new WebSocket.Server({ port: "3001" });
    this.ws.on("connection", (ws, req) => {
      console.log("server connection");
      this.online = this.ws._server._connections;
      console.log(`socket当前在线${this.online}个连接`);
      const { userId } = qs.parse(req.url.substr(1));
      ws.userId = userId;
      ws.on("message", (msg) => {
        console.log("server receive msg: ", msg.toString());
      });
      ws.on("close", () => {
        console.log("closed");
      });
    });
  }
  sendToClient(value) {
    let iskeep = false;
    if (!(this.ws instanceof WebSocket.Server)) {
      return iskeep;
    }
    const { userId } = value;
    this.ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(value));
        iskeep = true;
      }
      if (client.isAlive === false) {
        //如果非优雅断开 则强制停止 如网线被拔掉
        this.online--;
      }
    });
    return iskeep;
  }
}

module.exports = new Ws();
