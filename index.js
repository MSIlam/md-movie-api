const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const Models = require("./models.js");
const fs = require("fs");
const path = require("path");
const { check, validationResult } = require("express-validator");
const app = express();
// const swaggerJSDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");
const uuid = require("uuid");
// importing the mongoose models
const Movies = Models.Movie;
const Users = Models.User;

// log file
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS implementation
const cors = require("cors");
app.use(cors());

let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport.js");

// connecting to the dtabase
// local
// mongoose.connect("mongodb://127.0.0.1:27017/MyFlixDBMONGO", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// remote
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  let responseText = "Welcome to the movie world!";
  res.send(responseText);
});

//
// Return all users [Read]
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

//
// Return all movies to the user [Read]
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
        console.log("Movies:", movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// //
// Return data about a single movie by title to the user [Read]
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

// return data about a genre
app.get(
  "/movies/Genres/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Name } = req.params;
    try {
      const movie = await Movies.findOne({ "Genres.Name": Name });
      if (movie) {
        const genre = movie.Genres;
        res.status(200).json(genre);
      } else {
        res.status(404).json({ message: `Genre "${Name}" not found.` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

//
// Return data about a director (bio, birth year, death year) by name [Read]
app.get(
  "/movies/Director/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Name } = req.params;
    try {
      const movies = await Movies.findOne({
        "Director.Name": Name,
      });
      if (movies) {
        res.json(movies.Director);
      } else {
        res.status(404).json({ message: `Director "${Name}" not found.` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

//
// Allow new users to register [CREATE]
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//
// update user info by username
app.put(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    if (req.user.id !== req.params.id) {
      return res.status(400).send("permission denied");
    }
    await Users.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
      });
  }
);
//
// Add a  movie to a user's list of favourites

app.post(
  "/users/:id/movies/:MovieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { id: req.params.id },
      {
        $push: { FavouriteMovies: req.params.MovieId },
      },
      { new: true }
    )
      .then((updateUser) => {
        res.json(updateUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//
// Allow users to remove a movie from their list of favorits  [DELETE]
app.delete(
  "/users/:id/movies/:MovieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { userId: req.params.userId },
        {
          $pull: {
            FavouriteMovies: req.params.MovieId, // Assuming the MovieId is provided as a URL parameter
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        res
          .status(404)
          .json({ message: `User '${req.params.userId}' not found.` });
      } else {
        res.status(200).json(updatedUser);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

//
// Delete user by userid
app.delete(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ userId: req.params.userId })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.id + " was not found");
        } else {
          res.status(200).send(req.params.id + " was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
