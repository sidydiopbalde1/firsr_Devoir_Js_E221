import { getData } from "../fetch/fetch.js";

/**
 * Vérifie les credentials de l'utilisateur.
 * @param {string} email - L'adresse email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise<boolean>} - Retourne `true` si les credentials sont valides, sinon lève une erreur.
 */
async function verifierCredentials(email, password) {
    try {
        console.log("Vérification des credentials...");
        const etudiants = await getData("users");
        const etudiant = etudiants.find(
            (e) => e.login === email && e.password === password
        );

        if (!etudiant) {
            throw new Error("Identifiants incorrects");
        }

        // Stocker l'utilisateur connecté dans le localStorage
        localStorage.setItem("user", JSON.stringify(etudiant));
        return true;
    } catch (error) {
        console.error("Erreur lors de la vérification des credentials:", error);
        throw error;
    }
}

/**
 * Gère la soumission du formulaire de connexion.
 * @param {Event} event - L'événement de soumission du formulaire.
 */
async function connexion(event) {
    event.preventDefault();

    const email = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const estValide = await verifierCredentials(email, password);
        if (estValide) {
            // Rediriger l'utilisateur vers la page principale
            window.location.href = "index.html";
        }
    } catch (error) {
        const errorMessage = document.getElementById("errorMessage");
        if (errorMessage) {
            errorMessage.classList.remove("hidden");
        }
    }
}

/**
 * Vérifie si un utilisateur est connecté.
 * @returns {boolean} - Retourne `true` si l'utilisateur est connecté, sinon `false`.
 */
export function estConnecte() {
    const utilisateur = localStorage.getItem("user");
    return utilisateur !== null && utilisateur !== "undefined";
}

/**
 * Déconnecte l'utilisateur.
 */
export function deconnexion() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

/**
 * Protège l'accès aux pages nécessitant une connexion.
 */
function protegerPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const isLoginPage = currentPage === "login.html";

    if (!estConnecte() && !isLoginPage) {
        // Redirige vers la page de connexion uniquement si on n'est pas déjà dessus
        window.location.href = "login.html";
    }
}

// Ajouter les événements lorsque la page est chargée
document.addEventListener("DOMContentLoaded", () => {
    // Gestion du formulaire de connexion
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", connexion);
    }

    // Protéger les pages nécessitant une connexion
    protegerPage();

    // Empêcher l'utilisateur de revenir à une page protégée après déconnexion
    window.addEventListener("popstate", () => {
        if (!estConnecte()) {
            window.location.href = "login.html";
        }
    });
});

// Ajouter l'événement de déconnexion au bouton
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
    logoutButton.addEventListener("click", deconnexion);
}

export { verifierCredentials, connexion };
