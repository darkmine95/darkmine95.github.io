document.addEventListener("DOMContentLoaded", () => {
    // Sélection des éléments du DOM pour afficher les détails de l'anime
    const animeTitle = document.getElementById("animeTitle");
    const animeImage = document.getElementById("animeImage");
    const animeSynopsis = document.getElementById("animeSynopsis");
    const animeScore = document.getElementById("animeScore");
    const animeGenres = document.getElementById("animeGenres");
    const animeStatus = document.getElementById("animeStatus");
    const animeEpisodes = document.getElementById("animeEpisodes");
    const animeYear = document.getElementById("animeYear");
    const animeStudio = document.getElementById("animeStudio");
    const charactersContainer = document.getElementById("characters");

    // Fonction pour récupérer les détails d'un anime depuis une API
    async function fetchAnimeDetails(id) {
        try {
            // Requête à l'API pour obtenir les détails de l'anime
            const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
            const data = await response.json();
            const anime = data.data;

            // Mise à jour des éléments du DOM avec les détails de l'anime
            animeTitle.textContent = anime.title;
            animeImage.src = anime.images.jpg.image_url;
            animeSynopsis.innerHTML = anime.synopsis ? anime.synopsis.replace(/\n/g, "<br>") : "Pas de synopsis disponible.";
            animeScore.textContent = anime.score || "N/A";
            animeGenres.textContent = anime.genres.map(g => g.name).join(", ") || "N/A";
            animeStatus.textContent = anime.status || "N/A";
            animeEpisodes.textContent = anime.episodes || "N/A";
            animeYear.textContent = anime.year || "N/A";
            animeStudio.textContent = anime.studios ? anime.studios.map(s => s.name).join(", ") : "N/A";

            // Requête à l'API pour obtenir les personnages de l'anime
            const charactersResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
            const charactersData = await charactersResponse.json();
            const characters = charactersData.data.slice(0, 10); // Limite à 10 personnages

            // Création des éléments pour chaque personnage
            characters.forEach(character => {
                const charElement = document.createElement("div");
                charElement.classList.add("character");
                charElement.innerHTML = `
                    <a href="personnage.html?id=${character.character.mal_id}&animeId=${id}">
                        <img src="${character.character.images.jpg.image_url}" alt="${character.character.name}">
                        <p>${character.character.name}</p>
                    </a>
                `;
                charactersContainer.appendChild(charElement); // Ajoute le personnage au conteneur
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de l'anime :", error);
        }
    }

    // Récupération de l'ID de l'anime depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get("id");
    if (animeId) {
        fetchAnimeDetails(animeId); // Appel de la fonction pour récupérer les détails de l'anime
    }
});
