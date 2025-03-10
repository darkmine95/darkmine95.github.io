document.addEventListener("DOMContentLoaded", () => {
    // Sélection des éléments du DOM
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const animeList = document.getElementById("animeList");
    const themeFilter = document.getElementById("themeFilter");
    const sortFilter = document.getElementById("sortFilter");
    const pagination = document.getElementById("pagination");
    const themeToggle = document.getElementById("themeToggle");
    const loginButton = document.getElementById("loginButton");
    const favoritesList = document.getElementById("favoritesList");
    const watchlist = document.getElementById("watchlist");
    const userLists = document.getElementById("userLists");
    const yearFilter = document.getElementById("yearFilter");

    let currentPage = 1; // Page actuelle pour la pagination
    let isLoggedIn = false; // État de connexion de l'utilisateur

    // Fonction pour récupérer les animes depuis une API
    async function fetchAnimes(query = "", theme = "", sort = "", page = 1, year = "") {
        animeList.innerHTML = "<div class='loader'>Chargement...</div>"; // Affiche un indicateur de chargement
        try {
            let url = `https://api.jikan.moe/v4/anime?q=${query}&limit=25&page=${page}`; // URL de base de l'API
            if (theme) url += `&genres=${theme}`; // Ajoute le filtre de thème si présent
            if (year) url += `&start_date=${year}-01-01&end_date=${year}-12-31`; // Ajoute le filtre d'année si présent
            if (sort) url += `&order_by=${sort}`; // Ajoute le tri si présent

            const response = await fetch(url); // Requête à l'API
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const data = await response.json(); // Récupère les données JSON
            animeList.innerHTML = ""; // Efface l'indicateur de chargement

            if (data.data.length === 0) {
                animeList.innerHTML = "<p>Aucun anime trouvé.</p>"; // Message si aucun anime n'est trouvé
                return;
            }

            // Tri des animes selon le critère choisi
            const sortedData = data.data.sort((a, b) => {
                if (sort === "popularity") {
                    return b.popularity - a.popularity;
                } else if (sort === "score") {
                    return b.score - a.score;
                }
                return 0;
            });

            // Création des cartes d'anime
            sortedData.forEach(anime => {
                const animeCard = document.createElement("div");
                animeCard.classList.add("anime-card");

                // Vérifie si l'anime est dans les favoris
                const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
                if (favorites.some(fav => fav.id === anime.mal_id)) {
                    animeCard.classList.add("favorite");
                }

                // Récupère la note de l'utilisateur pour cet anime
                const ratings = JSON.parse(localStorage.getItem("animeRatings")) || {};
                const userRating = ratings[anime.mal_id] || "Non noté";

                // Contenu HTML de la carte d'anime
                animeCard.innerHTML = `
                    <a href="anime.html?id=${anime.mal_id}">
                        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
                        <h2>${anime.title}</h2>
                    </a>
                    <div class="rating">${userRating}</div>
                    <div class="action-buttons">
                        <button class="favorite-btn" onclick="toggleFavorite(${anime.mal_id}, '${anime.title}', '${anime.images.jpg.image_url}')">❤️</button>
                        <button class="watchlist-btn" onclick="addToList(${anime.mal_id}, '${anime.title}', '${anime.images.jpg.image_url}', 'watchlist')">📺</button>
                        <button class="rate-btn" onclick="rateAnime(${anime.mal_id})">⭐</button>
                    </div>
                `;
                animeList.appendChild(animeCard); // Ajoute la carte à la liste
            });

            // Mise à jour de la pagination
            pagination.innerHTML = `
                <button onclick="fetchAnimes('${query}', '${theme}', '${sort}', ${currentPage - 1}, '${year}')" ${currentPage === 1 ? 'disabled' : ''}>Précédent</button>
                <span>Page ${currentPage}</span>
                <button onclick="fetchAnimes('${query}', '${theme}', '${sort}', ${currentPage + 1}, '${year}')">Suivant</button>
            `;
        } catch (error) {
            animeList.innerHTML = "<p>Erreur lors de la récupération des animes. Veuillez réessayer.</p>";
            console.error(error);
        }
    }

    // Écouteurs d'événements pour les filtres et le formulaire de recherche
    searchInput.addEventListener("input", () => {
        fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
    });

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
    });

    themeFilter.addEventListener("change", () => {
        fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
    });

    sortFilter.addEventListener("change", () => {
        fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
    });

    // Bascule entre les thèmes sombre et clair
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        document.body.classList.toggle("light-theme");
        themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Mode Clair" : "🌙 Mode Sombre";
    });

    // Fonction pour afficher les listes d'utilisateur
    function displayLists() {
        favoritesList.innerHTML = "";
        watchlist.innerHTML = "";
        if (isLoggedIn) {
            const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
            const lists = JSON.parse(localStorage.getItem("animeLists")) || {};

            // Affiche les favoris
            favorites.forEach(anime => {
                favoritesList.innerHTML += `
                    <div class="favorite-item">
                        <img src="${anime.image}" alt="${anime.title}">
                        <span>${anime.title}</span>
                        <button class="remove-favorite" onclick="removeFromFavorites(${anime.id})">🗑️</button>
                    </div>`;
            });

            // Affiche la liste de visionnage
            const watchlistItems = lists.watchlist || [];
            watchlistItems.forEach(anime => {
                watchlist.innerHTML += `
                    <div class="watchlist-item">
                        <img src="${anime.image}" alt="${anime.title}">
                        <span>${anime.title}</span>
                        <button class="remove-watchlist" onclick="removeFromList(${anime.id}, 'watchlist')">🗑️</button>
                    </div>`;
            });

            userLists.classList.add("visible"); // Rend les listes visibles
        } else {
            userLists.classList.remove("visible"); // Cache les listes
        }
    }

    // Gestion de la connexion/déconnexion
    loginButton.addEventListener("click", () => {
        if (isLoggedIn) {
            isLoggedIn = false;
            loginButton.textContent = "👤 Se Connecter";
        } else {
            isLoggedIn = true;
            loginButton.textContent = "👤 Se Déconnecter";
        }
        displayLists();
    });

    // Fonction pour ajouter/retirer un anime des favoris
    window.toggleFavorite = (id, title, image) => {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const isFavorite = favorites.some(fav => fav.id === id);
        if (isFavorite) {
            removeFromFavorites(id);
        } else {
            favorites.push({ id, title, image });
            localStorage.setItem("favorites", JSON.stringify(favorites));
            alert("Ajouté aux favoris !");
        }
        displayLists();
    };

    // Fonction pour retirer un anime des favoris
    window.removeFromFavorites = (id) => {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favorites = favorites.filter(fav => fav.id !== id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Retiré des favoris !");
        displayLists();
        fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
    };

    // Fonction pour ajouter un anime à une liste
    window.addToList = (id, title, image, listName) => {
        const lists = JSON.parse(localStorage.getItem("animeLists")) || {};
        if (!lists[listName]) {
            lists[listName] = [];
        }
        if (!lists[listName].some(anime => anime.id === id)) {
            lists[listName].push({ id, title, image });
            localStorage.setItem("animeLists", JSON.stringify(lists));
            alert(`Ajouté à la liste ${listName} !`);
        } else {
            alert(`Déjà dans la liste ${listName} !`);
        }
        displayLists();
    };

    // Fonction pour retirer un anime d'une liste
    window.removeFromList = (id, listName) => {
        const lists = JSON.parse(localStorage.getItem("animeLists")) || {};
        if (lists[listName]) {
            lists[listName] = lists[listName].filter(anime => anime.id !== id);
            localStorage.setItem("animeLists", JSON.stringify(lists));
            alert(`Supprimé de la liste ${listName} !`);
        }
        displayLists();
    };

    // Fonction pour noter un anime
    window.rateAnime = (id) => {
        const rating = prompt("Notez cet anime de 1 à 10 :");
        if (rating) {
            const ratings = JSON.parse(localStorage.getItem("animeRatings")) || {};
            ratings[id] = rating;
            localStorage.setItem("animeRatings", JSON.stringify(ratings));
            alert(`Noté ${rating} !`);
            fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
        }
    };

    // Écouteur d'événement pour le filtre d'année
    yearFilter.addEventListener("input", () => {
        fetchAnimes(searchInput.value, themeFilter.value, sortFilter.value, currentPage, yearFilter.value);
    });

    // Affiche les listes et récupère les animes au chargement de la page
    displayLists();
    fetchAnimes();
});
