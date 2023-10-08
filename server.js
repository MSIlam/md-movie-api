const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  app = express();

app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

let users = [
  {
    id: 1,
    name: "Shayan",
    favouriteMovies: [],
    email: "Shayan2018@gmail.com",
    password: "sjdjnd",
    birthdate: "18-02-2018",
  },
  {
    id: 2,
    name: "Shahir",
    favouriteMovies: [{ Title: "The Pianist", movieID: 4 }],
    email: "Shahir2020@gmail.com",
    password: "idcjooo",
    birthdate: "06-01-2020",
  },
];

let topMovies = [
  {
    movieID: 1,
    Title: "Saving Private Rayan",
    Description:
      "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",

    Generes: {
      ID: "1",
      Name: "War",
      Description:
        "War film is a film genre concerned with warfare, typically about naval, air, or land battles, with combat scenes central to the drama",
    },
    Year: "1998",
    Director: {
      ID: 1,
      name: "Steven Spielberg",
      Bio: "One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywood's best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.",
      Birth: 1946,
    },
    ImageURL:
      "https://www.imdb.com/title/tt0120815/mediaviewer/rm1924732160/?ref_=tt_ov_i",
    Featured: false,
    Stars: "Tom Hanks, Matt Damon, Tom Sizemore",
  },
  {
    movieID: 2,
    Title: "The Shawshank Redemption",
    Description:
      "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    Generes: {
      ID: 2,
      Name: "Drama",
      Description:
        "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
    },
    Year: "1994",
    Director: {
      ID: 2,
      name: "Frank Darabont",
      Bio: "Three-time Oscar nominee Frank Darabont was born in a refugee camp in 1959 in Montbeliard, France, the son of Hungarian parents who had fled Budapest during the failed 1956 Hungarian revolution. Brought to America as an infant, he settled with his family in Los Angeles and attended Hollywood High School. His first job in movies was as a production assistant on the 1981 low-budget film",
      Birth: 1959,
    },
    ImageURL:
      "https://www.imdb.com/title/tt0111161/mediaviewer/rm1690056449/?ref_=tt_ov_i",
    Stars: "Tim Robbins, Morgan Freeman, Bob Gunton",
    Featured: false,
  },
  {
    movieID: 3,
    Title: "Forrest Gump",
    Description:
      "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
    Generes: {
      ID: 3,
      Name: "Romance",
      Description:
        "Romance films involve romantic love stories recorded in visual media for broadcast in theatres or on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters. Typically their journey through dating. ",
    },
    Year: "1994",
    Director: {
      ID: 3,
      name: "Robert Zemeckis",
      Bio: "A whiz-kid with special effects, Robert is from the Spielberg camp of film-making (Steven Spielberg produced many of his films). Usually working with writing partner Bob Gale, Robert's earlier films show he has a talent for zany comedy (Romancing the Stone (1984), 1941 (1979)) and special effect vehicles (Who Framed Roger Rabbit (1988) and Back to the Future (1985)). His later films have become more serious, with the hugely successful Tom Hanks vehicle Forrest Gump (1994) and the Jodie Foster film Contact (1997), both critically acclaimed movies. Again, these films incorporate stunning effects. Robert has proved he can work a serious story around great effects.",
      Birth: 1952,
    },
    ImageURL:
      "https://www.imdb.com/title/tt0109830/mediaviewer/rm1954748672/?ref_=tt_ov_i",
    Stars: "Tom Hanks, Robin Wright, Gary Sinise",
    Featured: false,
  },
  // {
  //   Title: "The Dark Knight",
  //   Generes: ["Action", "Thriller", "Mystery", "Comic"],
  //   Year: "1994",
  //   Director: "Christopher Nolan",
  //   Stars: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  // },
  // {
  //   Title: "Schindler's List",
  //   Generes: ["Biography", "Drama", "History", "War"],
  //   Year: "1993",
  //   Director: "Steven Spielberg",
  //   Stars: ["Liam Neeson", "Ralph Fiennes", "Ben Kingsley"],
  // },
  // {
  //   Title: "The Green Mile",
  //   Generes: ["Crime", "Drama", "Fantasy"],
  //   Year: "1999",
  //   Director: "Frank Darabont",
  //   Stars: ["Tom Hanks", "Michael Clarke Duncan", "David Morse"],
  // },
  // {
  //   Title: "The Pianist",
  //   Generes: ["Biography", "Drama", "Music"],
  //   Year: "2002",
  //   Director: "Roman Polanski",
  //   Stars: ["Adrien Brody", "Thomas Kretschmann", "Frank Finlay"],
  // },
  // {
  //   title: "Gladiator",
  //   Generes: ["Action", "Adventure", "Drama"],
  //   Year: "2000",
  //   Director: "Ridley Scott",
  //   Stars: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
  // },
  // {
  //   title: "A Separation",
  //   Generes: ["Drama", "Suspence"],
  //   Year: "2011",
  //   Director: "Asghar Farhadi",
  //   Stars: ["Payman Maadi", "Leila Hatami", "Sareh Bayat"],
  // },
  // {
  //   title: "Fight Club",
  //   Generes: ["Drama", "Action"],
  //   Year: "1999",
  //   Director: "David Fincher",
  //   Stars: ["Brad Pitt", "Edward Norton", "Meat loaf"],
  // },
];

app.get("/", (req, res) => {
  let responseText = "Welcome to the movie world!";
  res.send(responseText);
});

// Allow new users to register [CREATE]
app.post("/users", (req, res) => {
  const newUser = req.body;
  // Validate name, email, password, and birthdate
  if (
    !newUser.name ||
    !newUser.email ||
    !newUser.password ||
    !newUser.birthdate
  ) {
    res
      .status(400)
      .send("Please provide name, email, password, and birthdate.");
  } else {
    // Generate a unique ID for the new user
    newUser.id = uuid.v4();

    // Add the new user to the users array
    users.push(newUser);

    res.status(201).json(newUser);
  }
});

// Allow users to update their user info (username) [UPDATE]
app.put("/users/:id", (req, res) => {
  // Destructuring
  const { id } = req.params;
  const updatedUser = req.body;
  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    user.email = updatedUser.email;
    user.password = updatedUser.password;
    user.birthdate = updatedUser.birthdate;
    user.favouriteMovies = updatedUser.favouriteMovies;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added) [CREATE]
app.post("/users/:id/:movieID", (req, res) => {
  // Destructuring
  const { id, movieID } = req.params;
  let user = users.find((user) => user.id == id);

  if (user) {
    const movie = topMovies.find((movie) => movie.movieID == movieID);
    if (movie) {
      const movieobject = {
        title: movie.Title,
        id: movie.movieID,
      };
      user.favouriteMovies.push(movieobject);
      res.status(200).json(user);
    } else {
      res.status(400).send("no such movie found");
    }
  } else {
    res.status(400).send("No such user found.");
  }
});

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed) [DELETE]
app.delete("/users/:id/:movieID", (req, res) => {
  // Destructuring
  const { id, movieID } = req.params;
  let user = users.find((user) => user.id == id);

  if (user) {
    user.favouriteMovies = user.favouriteMovies.filter(
      (favMovieID) => favMovieID !== movieID
    );
    res
      .status(200)
      .send(
        `Movie ${movieID} has been removed from user ${id}\'s favourite list`
      );
  } else {
    res.status(400).send("no such user");
  }
});

// Allow existing users to deregister (showing only a text that a user email has been removed) [DELETE]
app.delete("/users/:id", (req, res) => {
  // Destructuring
  const { id } = req.params;
  let user = users.find((user) => user.id == id);

  if (user) {
    user = users.filter((user) => user.id != id);
    // res.json(user);
    res.status(200).send(`user ${id} has been removed from the list`);
  } else {
    res.status(400).send("no such user");
  }
});

// Return all movies to the user [Read]

app.get("/topMovies", (req, res) => {
  res.status(200).json(topMovies);
});

// Return data about a single movie by title to the user [Read]
app.get("/topMovies/:movieTitle", (req, res) => {
  const title = req.params.movieTitle;
  const movie = topMovies.find((movie) => movie.Title == title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

// Return data about a genre (description) by name/title (e.g., “Thriller”) [Read]
app.get("/topMovies/genere/:genereName", (req, res) => {
  const { genereName } = req.params;
  const genere = topMovies.find(
    (movie) => movie.Generes.Name === genereName
  ).Generes;

  if (genere) {
    res.status(200).json(genere);
  } else {
    res.status(400).send("no such genere");
  }
});

// Return data about a director (bio, birth year, death year) by name [Read]
app.get("/topMovies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find(
    (director) => director.Director.name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("My app is listening on port 8080");
});
