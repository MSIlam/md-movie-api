const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path");

const app = express();

app.use(express.static("public"));

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

app.get("/", (req, res) => {
  let responseText = "Welcome to the movie world!";
  res.send(responseText);
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("My app is listening on port 8080");
});
