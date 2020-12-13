const Nightmare = require("nightmare");
const fs = require("fs");
const request = require("request");
const path = require("path");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
browserEnv(["navigator"]);
var nightmare = Nightmare({
  show: true,
});
var input = [];
const inputMethod = async () => {
  return new Promise((resolve) => {
    rl.on("line", function (inp) {
      input.push(inp);
      rl.close();
      resolve();
    });
  });
};

const download = (url, path) => {
  return new Promise((resolve, reject) => {
    request.head(url, (err, res, body) => {
      if (res.statusCode > 400) {
        resolve(null);
      }
      request(url)
        .on("error", function (err) {
          resolve(null);
        })
        .pipe(fs.createWriteStream(path))
        .on("close", () => {
          resolve(path);
        });
    });
  });
};

module.exports = download;
const 멜론 = "https://www.melon.com/";
async function run(word) {
  return new Promise(async (resolve) => {
    await nightmare
      .goto(멜론)
      .wait(1000)
      .type("[class=ui-autocomplete-input]", word)
      .wait(1000)
      .click("[title=검색]")
      .wait(1000)
      .click("[data-coll=album] > a")
      .wait(1000);
    const pageList = await nightmare.evaluate(() => {
      return [...document.querySelectorAll(".page_num > a")].map((e) =>
        e.getAttribute("href")
      );
    });
    for (const idx in pageList) {
      const num = pageList[idx];
      let tempNum = num.replace(/javascript:pageObj.sendPage[(]'/g, "");
      tempNum = tempNum.replace(/'[)];/g, "");
      pageList[idx] = tempNum;
    }

    let MAX = pageList.length + 1;

    let ret = [],
      cnt = 0;

    for (let i = 0; i < MAX; i += 1) {
      if (i != 0) {
        await nightmare.evaluate((page) => {
          window.pageObj.sendPage(page);
        }, pageList[i - 1]).wait(1000);
      }
      const urlList = await nightmare.evaluate(() => {
        const temp = document.querySelector("div.wrap_album04 > a > img");
        if (temp === null) return [];
        else {
          return [
            ...document.querySelectorAll("div.wrap_album04 > a > img"),
          ].map((e) => e.getAttribute("src"));
        }
      });
      for (let idx in urlList) {
        const url = urlList[idx];
        let tempUrl = url.replace(/500.jpg/g, "1000.jpg");
        tempUrl = tempUrl.replace(/resize[/]260[/]/g, "");
        ret.push(
          download(
            tempUrl,
            path.join(__dirname, "img", word + "_" + cnt + ".jpg")
          )
        );
        cnt += 1;
      }
    }
    Promise.all(ret).then((e) => {
      resolve("done");
    });
  });
}
const makeFolder = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};
const exe = async () => {
  await inputMethod();
  makeFolder("img");
  console.log(await run(input[0]));
  process.exit(0);
};
exe();
