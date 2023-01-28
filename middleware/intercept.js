const { jwtVerify } = require("../utils/jwtUtils");

const noIntercept = [/\/api\/user\/userLogin/];

class Intercept {
  async intercept(ctx, next) {
    const { url } = ctx.request;
    if (noIntercept.filter((item) => item.test(url)).length) {
      console.log("当前地址可以直接访问");
    } else {
      const token = ctx.header.authorization;
      if (!token) {
        ctx.body = {
          code: "401",
          msg: "请先登录账号",
        };
        return;
      }
      const data = jwtVerify(token);
      if (!data) {
        ctx.body = {
          code: "401",
          msg: "token过期, 请重新登录",
        };
        return;
      }
    }
    await next();
  }
}

module.exports = new Intercept();
