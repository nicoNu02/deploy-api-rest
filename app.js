const express = require("express");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");
const crypto = require("node:crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.disable("x-powered-by");

app.get("/movies", (req, res) => {
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id == id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: `movie with id ${id} not found` });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error) });
  }
  //en base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  // Esto no seria REST porque estamos guardando
  // el estado de la aplicacion en memoria
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success)
    return res.status(400).json({ error: JSON.parse(result.error.message) });

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "movie not found" });
  }
  movies.splice(movieIndex, 1);

  return res.json({ message: "movie deleted" });
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
