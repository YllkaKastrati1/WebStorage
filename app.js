const API_KEY = "ea6ed756";
const API_URL = "https://www.omdbapi.com/";

let currentSearch = "";
let currentType = "";
let currentPage = 1;

const form = document.getElementById("formSearch");
const searchInput = document.getElementById("searchMovie");
const typeSelect = document.getElementById("typeSelect");
const movieList = document.getElementById("movieList");
const pagination = document.getElementById("pagination");
const movieDetails = document.getElementById("movieDetails");
const favoriteList = document.getElementById("favoriteList");

let favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

renderFavorites();

form.addEventListener("submit", function(e) {
    e.preventDefault();
    currentSearch = searchInput.value.trim();
    currentType = typeSelect.value;
    currentPage = 1;

    if (!currentSearch) {
        movieList.innerHTML = "Please enter a movie title.";
        pagination.innerHTML = "";
        movieDetails.innerHTML = "";


        return;
    }

    searchMovies(currentPage);
});

function searchMovies(page) {
    let url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(currentSearch)}&page=${page}`;
    if (currentType) 
        url += `&type=${currentType}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                renderMovies(data.Search);

                const totalResults = Number(data.totalResults);
                let totalPages = totalResults / 10;
                if (totalResults % 10 !== 0) totalPages = parseInt(totalPages) + 1;
                else totalPages = parseInt(totalPages);

                renderPagination(totalPages, page);
            } else {
                movieList.innerHTML = "Movie not found!";
                pagination.innerHTML = "";
                movieDetails.innerHTML = "";
            }
        })
        .catch(err => console.error(err));
}

function renderMovies(movies) {
    movieList.innerHTML = "";
    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const img = document.createElement("img");
        img.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300";
        img.alt = movie.Title;

        const title = document.createElement("h4");
        title.innerText = movie.Title;

        const year = document.createElement("p");
        year.innerText = movie.Year;

        const detailsBtn = document.createElement("button");
        detailsBtn.innerText = "Details";

        const favoriteBtn = document.createElement("button");
        favoriteBtn.innerText = favoriteMovies.includes(movie.imdbID) ? "Remove Favorite" : "Add Favorite";

        const detailsBox = document.createElement("div");
        detailsBox.style.display = "none";

        detailsBtn.addEventListener("click", () => {
            if (detailsBox.style.display === "none") {
                loadMovieDetails(movie.imdbID, detailsBox);
                detailsBox.style.display = "block";
                detailsBtn.innerText = "Hide";
            } else {
                detailsBox.style.display = "none";
                detailsBtn.innerText = "Details";
            }
        });

        favoriteBtn.addEventListener("click", () => {
            if (favoriteMovies.includes(movie.imdbID)) {
                favoriteMovies = favoriteMovies.filter(id => id !== movie.imdbID);
                favoriteBtn.innerText = "Add Favorite";
            } else {
                favoriteMovies.push(movie.imdbID);
                favoriteBtn.innerText = "Remove Favorite";
            }
            localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
            renderFavorites();
        });

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(year);
        card.appendChild(detailsBtn);
        card.appendChild(favoriteBtn);
        card.appendChild(detailsBox);

        movieList.appendChild(card);
    });
}

function renderPagination(totalPages, activePage) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        btn.innerText = i;
        if (i === activePage) btn.style.fontWeight = "bold";

        btn.addEventListener("click", () => {
            currentPage = i;
            searchMovies(i);
        });

        pagination.appendChild(btn);
    }
}

function loadMovieDetails(id, container) {
    fetch(`${API_URL}?apikey=${API_KEY}&i=${id}&plot=full`)
        .then(res => res.json())
        .then(movie => {
            container.innerHTML = `
                <h4>${movie.Title} (${movie.Year})</h4>
                <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300"}" alt="${movie.Title}" style="width:200px">
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = "Error loading details.";
        });
}

function renderFavorites() {
    favoriteList.innerHTML = "";
    if (favoriteMovies.length === 0) {
        favoriteList.innerHTML = "<p>No favorites yet.</p>";
        return;
    }

    favoriteMovies.forEach(id => {
        fetch(`${API_URL}?apikey=${API_KEY}&i=${id}`)
            .then(response => response.json())
            .then(movie => {
                const card = document.createElement("div");
                card.className = "movie-card";

                const img = document.createElement("img");
                img.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300";
                img.alt = movie.Title;

                const title = document.createElement("h4");
                title.innerText = movie.Title;

                const removeBtn = document.createElement("button");
                removeBtn.innerText = "Remove Favorite";

                removeBtn.addEventListener("click", () => {
                    favoriteMovies = favoriteMovies.filter(favId => favId !== movie.imdbID);
                    localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
                    renderFavorites();
                    const buttons = document.querySelectorAll(".movie-card button");
                    buttons.forEach(btn => {
                        if (btn.innerText === "Remove Favorite" && btn.parentNode.querySelector("h4").innerText === movie.Title) {
                            btn.innerText = "Add Favorite";
                        }
                    });
                });

                card.appendChild(img);
                card.appendChild(title);
                card.appendChild(removeBtn);

                favoriteList.appendChild(card);
            })
            .catch(err => console.error(err));
    });
}
