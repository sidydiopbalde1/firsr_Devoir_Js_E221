import { getData } from "../fetch/fetch.js";

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

        localStorage.setItem("user", JSON.stringify(etudiant));
        return true;
    } catch (error) {
        console.error("Erreur lors de la vérification des credentials:", error);
        throw error;
    }
}

async function connexion(event) {
    event.preventDefault();

    const email = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const estValide = await verifierCredentials(email, password);
        if (estValide) {
            window.location.href = "index.html";
        }
    } catch (error) {
        const errorMessage = document.getElementById("errorMessage");
        if (errorMessage) {
            errorMessage.classList.remove("hidden");
        }
    }
}

export function estConnecte() {
    const utilisateur = localStorage.getItem("user");
    return utilisateur !== null && utilisateur !== "undefined";
}

export function deconnexion() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function protegerPage() {
    const currentPage = window.location.pathname.split("/").pop();
    const isLoginPage = currentPage === "login.html";

    if (!estConnecte() && !isLoginPage) {
        window.location.href = "login.html";
    }

    if (estConnecte() && isLoginPage) {
        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", connexion);
    }

    // Protéger les pages nécessitant une connexion
    protegerPage();

    window.addEventListener("popstate", () => {
        protegerPage(); 
    });
});

const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
    logoutButton.addEventListener("click", deconnexion);
}
const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
};

function checkAuthentication() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
    }
}
export { verifierCredentials, connexion ,isAuthenticated,checkAuthentication };
