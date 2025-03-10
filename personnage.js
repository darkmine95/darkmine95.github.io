document.addEventListener("DOMContentLoaded", () => {
    // Sélection des éléments du DOM pour afficher les détails du personnage
    const characterName = document.getElementById("characterName");
    const characterImage = document.getElementById("characterImage");
    const characterDescription = document.getElementById("characterDescription");
    const characterRole = document.getElementById("characterRole");
    const characterVoiceActor = document.getElementById("characterVoiceActor");
    const characterVoiceActorFR = document.getElementById("characterVoiceActorFR");
    const backButton = document.getElementById("backButton");
    const errorDiv = document.getElementById("errorDiv");

    // Récupération des paramètres d'URL pour obtenir l'ID du personnage et de l'anime
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get("id");
    const animeId = urlParams.get("animeId");

    // Fonction pour récupérer les détails d'un personnage depuis une API
    async function fetchCharacterDetails(id) {
        try {
            // Affiche un message de chargement
            characterName.textContent = "Chargement...";

            // Requête à l'API pour obtenir les détails du personnage
            const response = await fetch(`https://api.jikan.moe/v4/characters/${id}`);
            const data = await response.json();
            const character = data.data;

            // Mise à jour des éléments du DOM avec les détails du personnage
            characterName.textContent = character.name;
            characterImage.src = character.images.jpg.image_url;
            characterDescription.textContent = character.about || "Pas de description disponible.";
            characterRole.textContent = character.role || "Non spécifié";

            // Vérifie et affiche les acteurs de doublage
            if (character.voice_actors && character.voice_actors.length > 0) {
                characterVoiceActor.textContent = character.voice_actors.find(actor => actor.language === "Japanese")?.person.name || "Non spécifié";
                characterVoiceActorFR.textContent = character.voice_actors.find(actor => actor.language === "French")?.person.name || "Non spécifié";
            } else {
                characterVoiceActor.textContent = "Non spécifié";
                characterVoiceActorFR.textContent = "Non spécifié";
            }

            // Efface les messages d'erreur
            errorDiv.textContent = "";
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du personnage :", error);
            errorDiv.textContent = "Erreur lors du chargement des données. Veuillez réessayer.";
            characterName.textContent = "Erreur";
        }
    }

    // Écouteur d'événement pour le bouton de retour
    backButton.addEventListener("click", () => {
        // Redirige vers la page des détails de l'anime
        window.location.href = `anime.html?id=${animeId}`;
    });

    // Appel de la fonction pour récupérer les détails du personnage si un ID est présent
    if (characterId) {
        fetchCharacterDetails(characterId);
    }
});
