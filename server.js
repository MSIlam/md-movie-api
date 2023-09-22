const http = require("http"),
  url = require("url"),
  fs = require("fs");
http
  .createServer((request, response) => {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = "";

    fs.appendFile(
      "log.text",
      "URL:" + addr + "\nTimestamp:" + new Date() + "\n\n",
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log.");
        }
      }
    );
    if (q.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
      response.writeHead(200, { "Content-Type": "text/html" });
    } else {
      filePath = __dirname + "/index.html";
      response.writeHead(200, { "Content-Type": "text/html" });
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }
      response.write(data);
      response.end("Hello Node!\n");
    });
  })
  .listen(8080);
console.log("My first Node test server is running on Port 8080.");
