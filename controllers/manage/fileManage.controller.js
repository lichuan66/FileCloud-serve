const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const { delDir } = require("../../utils/handleFile");
const mime = require("mime-types");
const gm = require("gm");
const { fromPath, fromBuffer } = require("pdf2pic");
const { PDFDocument } = require("pdf-lib");
const fsExtra = require("fs-extra");
const ws = require("../../config/config.websocket");

class FileManage {
  async getFileList(ctx) {
    const { routerPath } = ctx.request.body;
    const userName = "admin";
    let storePath = path.join(__dirname, "../../store");
    storePath = path.join(storePath, userName);
    const currentPath = path.join(storePath, routerPath);
    let fileList = fs.readdirSync(currentPath);
    fileList = fileList.filter((item) => !/^\./.test(item));
    fileList = fileList.map((item) => {
      let type, data;
      const filePath = path.join(currentPath, item);
      const stats = fs.statSync(filePath);
      const modifyTime = dayjs(stats.mtime).format("YYYY-MM-DD hh:mm");
      if (stats.isDirectory()) {
        type = "folder";
        data = null;
      } else if (
        /rar/.test(mime.lookup(filePath)) ||
        /zip/.test(mime.lookup(filePath))
      ) {
        type = mime.lookup(filePath);
        data = null;
      } else if (/pdf/.test(mime.lookup(filePath))) {
        const suoluePath = path.join(
          currentPath,
          `.image/${item.replace(".pdf", ".png")}`
        );
        if (fs.readFileSync(suoluePath).length) {
          type = mime.lookup(filePath);
          data = fs.readFileSync(suoluePath);
          data = `data:image/png;base64,${data.toString("base64")}`;
        } else {
          (type = "uploading"), (data = null);
        }
      } else {
        const suoluePath = path.join(currentPath, `.image/${item}`);
        if (fs.readFileSync(suoluePath).length) {
          type = mime.lookup(filePath);
          data = fs.readFileSync(suoluePath);
          data = `data:image/png;base64,${data.toString("base64")}`;
        } else {
          (type = "uploading"), (data = null);
        }
      }
      return {
        name: item,
        modifyTime,
        type,
        data,
      };
    });
    ctx.body = { data: fileList };
  }

  async createFolder(ctx) {
    const { routerPath, folderName } = ctx.request.body;
    const storePath = path.join(__dirname, "../../store/admin");
    const currentPath = path.join(storePath, routerPath);
    const folderPath = path.join(currentPath, folderName);
    fs.mkdirSync(folderPath);
    fs.mkdirSync(path.join(folderPath, ".image"));
    ctx.body = { data: null, msg: "文件夹创建成功" };
  }

  async deleteFolder(ctx) {
    const { routerPath, folderName } = ctx.request.body;
    const storePath = path.join(__dirname, "../../store/admin");
    const currentPath = path.join(storePath, routerPath);
    const folderPath = path.join(currentPath, folderName);
    if (fs.statSync(folderPath).isDirectory()) {
      delDir(folderPath);
    } else if (fs.statSync(folderPath).isFile()) {
      fs.unlinkSync(folderPath);
      const type = mime.lookup(folderPath);
      let suoluePath;
      if (/pdf/.test(type)) {
        suoluePath = path.join(
          currentPath,
          `.image/${folderName.replace(".pdf", ".png")}`
        );
      } else {
        suoluePath = path.join(currentPath, `.image/${folderName}`);
      }
      if (fs.existsSync(suoluePath)) {
        fs.unlinkSync(suoluePath);
      }
    }
    ctx.body = { data: null, msg: "文件夹已删除" };
  }

  async enterFolder(ctx) {
    const { routerPath, folderName } = ctx.request.body;
    const storePath = path.join(__dirname, "../../store/admin");
    const currentPath = path.join(storePath, routerPath);
    const folderPath = path.join(currentPath, folderName);
    let fileList = fs.readdirSync(folderPath);
    fileList = fileList.filter((item) => !/^\./.test(item));
    fileList = fileList.map((item) => {
      let type, data;
      const filePath = path.join(folderPath, item);
      const stats = fs.statSync(filePath);
      const modifyTime = dayjs(stats.mtime).format("YYYY-MM-DD hh:mm");
      if (stats.isDirectory()) {
        type = "folder";
        data = null;
      } else if (
        /rar/.test(mime.lookup(filePath)) ||
        /zip/.test(mime.lookup(filePath))
      ) {
        type = mime.lookup(filePath);
        data = null;
      } else if (/pdf/.test(mime.lookup(filePath))) {
        const suoluePath = path.join(
          currentPath,
          `.image/${item.replace(".pdf", ".png")}`
        );
        if (fs.readFileSync(suoluePath).length) {
          type = mime.lookup(filePath);
          data = fs.readFileSync(suoluePath);
          data = `data:image/png;base64,${data.toString("base64")}`;
        } else {
          (type = "uploading"), (data = null);
        }
      } else {
        const suoluePath = path.join(currentPath, `.image/${item}`);
        if (fs.readFileSync(suoluePath).length) {
          type = mime.lookup(filePath);
          data = fs.readFileSync(suoluePath);
          data = `data:image/png;base64,${data.toString("base64")}`;
        } else {
          (type = "uploading"), (data = null);
        }
      }
      return {
        name: item,
        modifyTime,
        type,
        data,
      };
    });
    ctx.body = { data: fileList };
  }

  async uploadFile(ctx) {
    const stream = ctx.request.file;
    const { fileName, routerPath } = ctx.request.body;
    const storePath = path.join(__dirname, "../../store/admin");
    const currentPath = path.join(storePath, routerPath);
    const filePath = path.join(currentPath, fileName);
    let funcNext;
    const tempPromise = new Promise((resolve) => {
      funcNext = () => resolve();
    });
    fs.writeFileSync(filePath, stream.buffer);
    if (/image/.test(stream.mimetype)) {
      const suoluePath = path.join(currentPath, `.image/${fileName}`);
      const writeStream = fs.createWriteStream(suoluePath);
      const readStream = fs.createReadStream(filePath);
      gm(readStream, fileName)
        .resize(240, 240)
        .noProfile()
        .stream("png")
        .pipe(writeStream);
      writeStream.on("finish", () => {
        const funcType = "upload";
        let data = fs.readFileSync(suoluePath);
        data = `data:image/png;base64,${data.toString("base64")}`;
        ws.sendToClient({
          funcType,
          userId: "admin",
          type: stream.mimetype,
          fileName,
          data,
        });
      });
      funcNext();
    } else if (/pdf/.test(stream.mimetype)) {
      const suoluePath = path.join(
        currentPath,
        `.image/${fileName.replace(".pdf", "")}.png`
      );
      const writeStream = fs.createWriteStream(suoluePath);
      const readStream = fs.createReadStream(filePath);
      gm(readStream)
        .selectFrame(0)
        .resize(240, 240)
        .noProfile()
        .stream("png")
        .pipe(writeStream);
      writeStream.on("finish", () => {
        const funcType = "upload";
        let data = fs.readFileSync(suoluePath);
        data = `data:image/png;base64,${data.toString("base64")}`;
        ws.sendToClient({
          funcType,
          userId: "admin",
          type: stream.mimetype,
          fileName,
          data,
        });
      });
      funcNext();
    } else {
      funcNext();
    }
    await tempPromise;
    ctx.body = { data: null, msg: "上传成功" };
  }

  async getFileData(ctx) {
    const { routerPath, fileName } = ctx.request.body;
    const storePath = path.join(__dirname, "../../store/admin");
    const currentPath = path.join(storePath, routerPath);
    const filePath = path.join(currentPath, fileName);
    const type = mime.lookup(filePath);
    const stats = fs.statSync(filePath);
    const modifyTime = dayjs(stats.mtime).format("YYYY-MM-DD hh:mm");
    let metaData = {};
    if (/pdf/.test(type)) {
      let data = fs.readFile(filePath, async (err, buffer) => {
        const funcType = "getFile";
        // const pdfDoc = await PDFDocument.load(buffer);
        // const pages = await pdfDoc.getPages();
        // const imgBufferList = {};
        // const start = Date.now();
        // for (let i = 0; i < 100; i++) {
        //   let funcNext = null;
        //   const waittingPromise = new Promise((resolve, reject) => {
        //     funcNext = () => resolve();
        //   });
        //   const pdfPagePath = path.join(currentPath, `.image/${i}.png`);
        //   const writeStream = fs.createWriteStream(pdfPagePath);
        //   gm(filePath)
        //     .selectFrame(i)
        //     .resize(800, 800)
        //     .toBuffer("PNG", function (err, buffer) {
        //       if (err) {
        //         console.log(err);
        //         funcNext();
        //         return;
        //       }
        //       const data = `data:image/png;base64,${buffer.toString("base64")}`;
        //       imgBufferList[i] = data;
        //       console.log(i);
        //       funcNext();
        //     });
        //   // .stream("png")
        //   // .pipe(writeStream)
        //   // writeStream.on("finish", () => {
        //   //   let data = fs.readFile(filePath, (err, buffer) => {
        //   //     if (err) {
        //   //       console.log(i, err);
        //   //       return;
        //   //     }
        //   //     const data = `data:image/png;base64,${buffer.toString("base64")}`;
        //   //     imgBufferList[i] = data;
        //   //     fs.rmSync(pdfPagePath);
        //   //     funcNext();
        //   //   });
        //   // });
        //   await waittingPromise;
        // }
        // const end = Date.now();
        // console.log((end - start) / 1000);
        const bufferStr = `${buffer.toString("base64")}`;
        ws.sendToClient({
          funcType,
          userId: "admin",
          type,
          name: fileName,
          data: bufferStr,
        });
        console.log("完成");
      });
      metaData = {
        name: fileName,
        modifyTime,
        type,
        data: null,
      };
    } else if (/image/.test(type)) {
      let data = fs.readFile(filePath, (err, buffer) => {
        const funcType = "getFile";
        const data = `data:image/png;base64,${buffer.toString("base64")}`;
        ws.sendToClient({
          funcType,
          userId: "admin",
          modifyTime,
          type,
          data,
        });
      });
      metaData = {
        name: fileName,
        modifyTime,
        type,
        data: null,
      };
    }
    ctx.body = { data: metaData };
  }
}

module.exports = new FileManage();
