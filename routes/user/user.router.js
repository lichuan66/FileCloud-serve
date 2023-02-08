const router = require("koa-router")();

const {
  userLogin,
  signUp,
} = require("../../controllers/user/login.controller");

router.prefix("/api/user");

router.post("/userLogin", userLogin);
router.post("/signUp", signUp);

module.exports = router;
