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

  async signUp(ctx) {
    const { userName, password, email } = ctx.request.body;
    console.log(userName, password, email);
    const userInfoPath = path.join(
      __dirname,
      "../../public/userInfo/userInfo.json"
    );
    const userInfoBuffer = await fs.promises.readFile(userInfoPath);
    const userInfoJson = JSON.parse(userInfoBuffer.toString());
    const userList = Object.keys(userInfoJson);
    let errMsg = "";
    let status = true;
    for (let i = 0; i < userList.length; i++) {
      const obj = userInfoJson[userList[i]];
      if (obj.userName === userName) {
        errMsg = "用户名重复, 请重新输入";
        status = false;
        break;
      }
      if (obj.email === email) {
        errMsg = "邮箱已被注册";
        status = false;
        break;
      }
    }
    if (status) {
      userInfoJson[userList.length + 1] = {
        userName,
        password,
        email,
      };
      await fs.promises.writeFile(
        userInfoPath,
        new Buffer(JSON.stringify(userInfoJson))
      );
      const newFolder = path.join(__dirname, `../../store/${userName}`);
      await fs.promises.mkdir(newFolder);
      await fs.promises.mkdir(newFolder + "/.image");
      const token = jwtSign(userName);
      ctx.body = { data: { token, userName }, status: true, errMsg };
    } else {
      ctx.body = { status: false, errMsg };
    }
  }
}

module.exports = new Login();
