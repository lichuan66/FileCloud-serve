const fs = require("fs");
const path = require("path");

// 删除文件夹及子内容
function delDir(folderPath) {
  if (fs.existsSync(folderPath)) {
    const fileList = fs.readdirSync(folderPath);
    fileList.forEach((item) => {
      const filePath = path.join(folderPath, item);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        delDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

module.exports = { delDir };
