const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const Models = require("./models.js");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
const { capitalizeFirstLetter } = require("./helpers.js");
const app = express();
// const swaggerJSDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");
const uuid = require("uuid");
// importing the mongoose models
const Movies = Models.Movie;
const Users = Models.User;

// cors implementation of web server
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "https://myflix-mi.netlify.app",
  "http://localhost:4200",
  "https://msilam.github.io/myFlix-Angular-client/",
  "https://cute-medovik-3c0b89.netlify.app",
  "https://my-flix-angular-client-rl5m7x43i.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
// log file
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS implementation
// app.use(cors());

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

/**
 * Get all movies route.
 *
 * @function
 * @name getAllMovies
 * @memberof app
 * @param {string} "/movies" - The route path for retrieving movies.
 * @param {function} passport.authenticate - Middleware for authenticating with JWT.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the list of movies or an error response.
 * @throws Will throw an error if there's an issue with the database or authentication.
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Get a user by ID route.
 *
 * @function
 * @name getOneUser
 * @memberof app
 * @param {string} "/users/:id" - The route path for retrieving a user by ID.
 * @param {function} passport.authenticate - Middleware for authenticating with JWT.
 * @param {object} req - Express request object containing the user ID in params.
 * @param {string} req.params.id - The ID of the user to retrieve.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the user object or an error response.
 * @throws Will throw an error if there's an issue with the database, authentication, or user ID is not found.
 */
app.get(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findById(req.params.id)
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Get a movie by ID route.
 *
 * @function
 * @name getOneMovie
 * @memberof app
 * @param {string} "/movies/:id" - The route path for retrieving a movie by ID.
 * @param {function} passport.authenticate - Middleware for authenticating with JWT.
 * @param {object} req - Express request object containing the movie ID in params.
 * @param {string} req.params.id - The ID of the movie to retrieve.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the movie object or an error response.
 * @throws Will throw an error if there's an issue with the database, authentication, or movie ID is not found.
 */
app.get(
  "/movies/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findById(req.params.id)
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

/**
 * Get genre information
 *
 * @function
 * @name getGenre
 * @memberof app
 * @param {string} "/movies/genres/:name" - The route path for retrieving movies by genre name.
 * @param {function} passport.authenticate - Middleware for authenticating with JWT.
 * @param {object} req - Express request object containing the genre name in params.
 * @param {string} req.params.name - The name of the genre to retrieve movies.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to an array of movies in the specified genre or an error response.
 * @throws Will throw an error if there's an issue with the database, authentication, or genre name is not found.
 */
app.get(
  "/movies/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name } = req.params;
    try {
      const movie = await Movies.findOne({
        "Genres.Name": capitalizeFirstLetter(name),
      });
      if (movie) {
        const genre = movie.Genres;
        res.status(200).json(genre);
      } else {
        res.status(404).json({ message: `Genre "${name}" not found.` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * Get director information
 *
 * @function
 * @name getDirector
 * @memberof app
 * @param {string} "/movies/directors/:name" - The route path for retrieving movies by director name.
 * @param {function} passport.authenticate - Middleware for authenticating with JWT.
 * @param {object} req - Express request object containing the director name in params.
 * @param {string} req.params.name - The name of the director to retrieve movies.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to an array of movies directed by the specified director or an error response.
 * @throws Will throw an error if there's an issue with the database, authentication, or director name is not found.
 */
app.get(
  "/movies/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name } = req.params;
    try {
      const movies = await Movies.findOne({
        "Director.Name": capitalizeFirstLetter(name),
      });
      if (movies) {
        res.json(movies.Director);
      } else {
        res.status(404).json({ message: `Director "${name}" not found.` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * User registration route.
 *
 * @function
 * @name userRegistration
 * @memberof app
 * @param {string} "/users" - The route path for user registration.
 * @param {Array} check - Middleware for validating request body.
 * @param {object} check[].Username - Validation for the Username field.
 * @param {string} check[].Username.isLength - Validation for the minimum length of Username.
 * @param {string} check[].Username.isAlphanumeric - Validation for alphanumeric characters in Username.
 * @param {object} check[].Password - Validation for the Password field.
 * @param {string} check[].Password.not().isEmpty - Validation for non-empty Password.
 * @param {object} check[].Email - Validation for the Email field.
 * @param {string} check[].Email.isEmail - Validation for a valid Email format.
 * @param {object} req - Express request object containing user registration details.
 * @param {object} req.body - Request body containing user registration data.
 * @param {string} req.body.Username - User's chosen username.
 * @param {string} req.body.Password - User's chosen password.
 * @param {string} req.body.Email - User's email address.
 * @param {string} req.body.Birthday - User's birthday (optional).
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the newly created user or an error response.
 * @throws Will throw an error if there's an issue with input validation, user already exists, or database error.
 */
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

    const hashedPassword = Users.hashPassword(req.body.Password);
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

/**
 * User update route.
 *
 * @function
 * @name userUpdate
 * @memberof app
 * @param {string} "/users/:id" - The route path for updating a user's information.
 * @param {function} passport.authenticate - Middleware for authenticating using JSON Web Tokens.
 * @param {object} req - Express request object containing user update details.
 * @param {object} req.user - Authenticated user object from the JSON Web Token.
 * @param {string} req.user._id - User's unique identifier.
 * @param {string} req.params.id - User's unique identifier from the request parameters.
 * @param {object} req.body - Request body containing user update data.
 * @param {string} req.body.Username - Updated username (optional).
 * @param {string} req.body.Password - Updated password (optional).
 * @param {string} req.body.Email - Updated email address (optional).
 * @param {string} req.body.Birthday - Updated birthday (optional).
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the updated user or an error response.
 * @throws Will throw an error if there's an issue with permissions, input validation, or database error.
 */
app.put(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const hashedPassword = Users.hashPassword(req.body.Password);
    console.log(req.user._id.toString(), req.params.id);
    if (req.user._id.toString() !== req.params.id) {
      return res.status(400).send("permission denied");
    }
    await Users.findOneAndUpdate(
      { _id: req.params.id },
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

/**
 * Add movie to user's favorite list route.
 *
 * @function
 * @name addFavoriteMovie
 * @memberof app
 * @param {string} "/users/:id/movies/:MovieId" - The route path for adding a movie to a user's favorite list.
 * @param {function} passport.authenticate - Middleware for authenticating using JSON Web Tokens.
 * @param {object} req - Express request object containing details for adding a movie to the favorite list.
 * @param {string} req.params.id - User's unique identifier from the request parameters.
 * @param {string} req.params.MovieId - Movie's unique identifier from the request parameters.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the updated user or an error response.
 * @throws Will throw an error if MovieId is invalid, the movie is not found, or there's a database error.
 */

app.post(
  "/users/:id/movies/:MovieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Validate that MovieId is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.MovieId)) {
        return res.status(400).send("Invalid MovieId");
      }

      // Check if the movie with the provided MovieId exists
      const movie = await Movies.findById(req.params.MovieId);
      if (!movie) {
        return res.status(404).send("Movie not found");
      }

      // Update the user's list of favorite movies
      const updatedUser = await Users.findOneAndUpdate(
        { _id: req.params.id },
        {
          $addToSet: { FavouriteMovies: req.params.MovieId },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * Remove movie from user's favorite list route.
 *
 * @function
 * @name removeFavoriteMovie
 * @memberof app
 * @param {string} "/users/:id/movies/:MovieId" - The route path for removing a movie from a user's favorite list.
 * @param {function} passport.authenticate - Middleware for authenticating using JSON Web Tokens.
 * @param {object} req - Express request object containing details for removing a movie from the favorite list.
 * @param {string} req.params.id - User's unique identifier from the request parameters.
 * @param {string} req.params.MovieId - Movie's unique identifier from the request parameters.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to the updated user or an error response.
 * @throws Will throw an error if there's a database error.
 */
app.delete(
  "/users/:id/movies/:MovieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: {
            FavouriteMovies: req.params.MovieId, // Assuming the MovieId is provided as a URL parameter
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        res.status(404).json({ message: `User '${req.params.id}' not found.` });
      } else {
        res.status(200).json(updatedUser);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

/**
 * Delete user route.
 *
 * @function
 * @name deleteUser
 * @memberof app
 * @param {string} "/users/:id" - The route path for deleting a user.
 * @param {function} passport.authenticate - Middleware for authenticating using JSON Web Tokens.
 * @param {object} req - Express request object containing details for deleting a user.
 * @param {string} req.params.id - User's unique identifier from the request parameters.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves to a success or error response.
 * @throws Will throw an error if there's a database error.
 */
app.delete(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ _id: req.params.id })
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
