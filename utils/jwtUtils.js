const jwt = require("jsonwebtoken");

const JWT_SRCRET = "fileGo";

class JwtUtils {
  jwtSign(data) {
    const config = 24 * 3600;
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000 + config),
        data: data,
      },
      JWT_SRCRET
    );
    return token;
  }
  jwtVerify(token) {
    try {
      const decode = jwt.verify(token, JWT_SRCRET);
      return decode.data;
    } catch (err) {
      return null;
    }
  }
}

module.exports = new JwtUtils();
