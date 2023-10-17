const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const Models = require("./models.js");
const fs = require("fs");
const path = require("path");
const app = express();
// const swaggerJSDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");
const uuid = require("uuid");

// log file
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

// connecting to the dtabase
mongoose.connect("mongodb://127.0.0.1:27017/MyFlixDBMONGO", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// importing the mongoose models
const Movies = Models.Movie;
const Users = Models.User;

app.get("/", (req, res) => {
  let responseText = "Welcome to the movie world!";
  res.send(responseText);
});

//
// Return all users [Read]
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

//
// Return all movies to the user [Read]
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

// //
// Return data about a single movie by title to the user [Read]
app.get("/movies/:Title", async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

// return data about a genre
app.get("/movies/Genres/:Name", async (req, res) => {
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
});

//
// Return data about a director (bio, birth year, death year) by name [Read]
app.get("/movies/Director/:Name", async (req, res) => {
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
});

//
// Allow new users to register [CREATE]
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birth_date: req.body.Birth_date,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error" + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error:" + error);
    });
});

//
// update user info by id
app.put(
  "/users/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.UserID !== req.params.UserID) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndUpdate(
      { UserID: req.params.UserID },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updateUser) => {
        res.json(updateUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

//
// Add a  movie to a user's list of favourites

app.post("/users/:_id/:MovieId", async (req, res) => {
  await Users.findOneAndUpdate(
    { _id: req.params._id },
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
});

//
// Allow users to remove a movie from their list of favourits (showing only a text that a movie has been removed) [DELETE]
app.delete("/users/:_id/:MovieId", async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { _id: req.params._id },
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
        .json({ message: `User '${req.params.Username}' not found.` });
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

//
// Delete user by username
app.delete("/users/:Username", async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("My app is listening on port 8080");
});
