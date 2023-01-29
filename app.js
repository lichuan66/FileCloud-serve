const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("koa2-cors");

const user = require("./routes/user/user.router");
const folderManage = require("./routes/manage/fileManage.router");
const ws = require("./config/config.websocket");

const { intercept } = require("./middleware/intercept.js");

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(cors());
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public/dist"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await intercept(ctx, next);
});

// routes
app.use(folderManage.routes(), folderManage.allowedMethods());
app.use(user.routes(), user.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

let server = app.listen(8877, function () {
  console.log("服务器已开启监听");
});

server.timeout = 5 * 60 * 1000;

ws.init();

module.exports = app;
