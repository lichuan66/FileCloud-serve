const router = require("koa-router")();

const { userLogin } = require("../../controllers/user/login.controller");

router.prefix("/api/user");

router.post("/userLogin", userLogin);

module.exports = router;
