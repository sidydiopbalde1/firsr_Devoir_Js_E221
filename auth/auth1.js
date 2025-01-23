import { getData } from "../fetch/fetch.js";

async function verifierCredentials(email, password) {
    try {
        console.log('Vérification des credentials...');
        const etudiants = await getData('users');
        const etudiant = etudiants.find(e => 
            e.login === email && e.password === password
        );

        if (!etudiant) {
            throw new Error('Identifiants incorrects');
        }
        const utilisateur = etudiant;
        if (utilisateur) {
            localStorage.setItem('user', JSON.stringify(utilisateur));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification des credentials:', error);
        throw error;
    }
}

async function connexion(event) {
    event.preventDefault();
    event.stopPropagation();

    const email = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    
        const estValide = await verifierCredentials(email, password);
        if (estValide) {
            window.location.href = 'index.html';
        } else {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.classList.remove('hidden');
            return false;
        }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            connexion(e);
        });
    }
    if (estConnecte()) {
         window.location.href = 'index.html'; 
    }else{
        window.location.href = 'index.html'; 
    }
});

export function estConnecte() {
    const utilisateur = localStorage.getItem('user');
    return utilisateur !== null && utilisateur !== 'undefined';
}


const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      deconnexion();
    });
}
export function deconnexion() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
export { verifierCredentials, connexion };