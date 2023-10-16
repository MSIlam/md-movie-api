const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Year: String,
  Director: {
    Name: String,
    Bio: String,
    Birthyear: Date,
  },
  ImageURL: String,
  Stars: String,
  Featured: Boolean,
  Genres: {
    genreName: String,
    Description: String,
  },
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, requied: true },
  Email: { type: String, required: true },
  Birth_date: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
