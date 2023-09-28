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

let topMovies = [
  {
    title: "Saving Private Rayan",
    Generes: ["War", "Action", "Adventure"],
    Year: "1998",
    Director: "Steven Spielberg",
    Stars: ["Tom Hanks", "Matt Damon", "Tom Sizemore"],
  },
  {
    title: "The Shawshank Redemption",
    Generes: ["Prison", "Drama", "Mystery"],
    Year: "1994",
    Director: "Frank Darabont",
    Stars: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
  },
  {
    title: "Forrest Gump",
    Generes: ["Romance", "Comedy", "Drama"],
    Year: "1994",
    Director: "Robert Zemeckis",
    Stars: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
  },
  {
    title: "The Dark Knight",
    Generes: ["Action", "Thriller", "Mystery", "Comic"],
    Year: "1994",
    Director: "Christopher Nolan",
    Stars: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  },
  {
    title: "Schindler's List",
    Generes: ["Biography", "Drama", "History", "War"],
    Year: "1993",
    Director: "Steven Spielberg",
    Stars: ["Liam Neeson", "Ralph Fiennes", "Ben Kingsley"],
  },
  {
    title: "The Green Mile",
    Generes: ["Crime", "Drama", "Fantasy"],
    Year: "1999",
    Director: "Frank Darabont",
    Stars: ["Tom Hanks", "Michael Clarke Duncan", "David Morse"],
  },
  {
    title: "The Pianist",
    Generes: ["Biography", "Drama", "Music"],
    Year: "2002",
    Director: "Roman Polanski",
    Stars: ["Adrien Brody", "Thomas Kretschmann", "Frank Finlay"],
  },
  {
    title: "Gladiator",
    Generes: ["Action", "Adventure", "Drama"],
    Year: "2000",
    Director: "Ridley Scott",
    Stars: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
  },
  {
    title: "A Separation",
    Generes: ["Drama", "Suspence"],
    Year: "2011",
    Director: "Asghar Farhadi",
    Stars: ["Payman Maadi", "Leila Hatami", "Sareh Bayat"],
  },
  {
    title: "Fight Club",
    Generes: ["Drama", "Action"],
    Year: "1999",
    Director: "David Fincher",
    Stars: ["Brad Pitt", "Edward Norton", "Meat loaf"],
  },
];

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
