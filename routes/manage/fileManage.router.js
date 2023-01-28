const router = require("koa-router")();
const {
  getFileList,
  createFolder,
  deleteFolder,
  enterFolder,
  uploadFile,
  getFileData,
} = require("../../controllers/manage/fileManage.controller");
const multer = require("@koa/multer");
const upload = multer();

router.prefix("/api/fileManage");

router.post("/getFileList", getFileList);
router.post("/createFolder", createFolder);
router.post("/deleteFolder", deleteFolder);
router.post("/enterFolder", enterFolder);
router.post("/uploadFile", upload.single("file"), uploadFile);
router.post("/getFileData", getFileData);

module.exports = router;
