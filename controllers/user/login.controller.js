const fs = require("fs");
const path = require("path");
const { jwtSign } = require("../../utils/jwtUtils");

class Login {
  async userLogin(ctx) {
    const { userName, password } = ctx.request.body;
    console.log(userName, password);
    const userInfoPath = path.join(
      __dirname,
      "../../public/userInfo/userInfo.json"
    );
    const userInfo = JSON.parse(fs.readFileSync(userInfoPath).toString());
    const userList = Object.keys(userInfo);
    const userListFilter = userList.filter(
      (item) =>
        userInfo[item].userName === userName &&
        userInfo[item].password === password
    );
    if (userListFilter.length) {
      const token = jwtSign(userName);
      ctx.body = {
        data: {
          userName,
          token,
        },
        msg: "成功",
      };
    } else {
      ctx.body = { data: null, msg: "密码错误" };
    }
  }
}

module.exports = new Login();
