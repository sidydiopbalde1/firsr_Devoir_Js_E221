import { getData } from "../fetch/fetch.js";


const loginForm = document.getElementById('loginForm');


if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const users = await getData(`users`); 
            console.log('Users:', users);

            if (!users || users.length === 0) {
                throw new Error('No users found');
            }

            // Vérification des informations d'identification
            const user = users.find(u => u.login === login && u.password === password);
            console.log('User found:', user);

            if (user) {
               
                localStorage.setItem('user', JSON.stringify(user));

                window.location.href = "index.html";
            } else {
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again later.');
        }
    });
}

// Gestion de la déconnexion
const logoutButton = document.getElementById('logoutBtn');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        // Suppression des données utilisateur du localStorage
        localStorage.removeItem('user');
        
        // Redirection vers la page de connexion
        window.location.href = "login.html";
    });
}
