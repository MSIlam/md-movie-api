const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
  MovieId: { type: String },
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    genreName: String,
    Description: String,
  },
  Director: {
    directorName: String,
    Bio: String,
    Birthday: String,
  },
  Stars: String,
  ImageURL: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  UserId: { type: String },
  Username: { type: String, required: true },
  Password: { type: String, requied: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
