let currentTheme = window.localStorage.getItem('theme') || 'auto';

function applyTheme(theme) {
    const body = document.body;

    if (theme === 'dark') {
        body.classList.add('dark');
        body.classList.remove('light');
        themeToggle.textContent = '🌞'; // Icône pour passer en mode clair
    } else if (theme === 'light') {
        body.classList.add('light');
        body.classList.remove('dark');
        themeToggle.textContent = '🌙'; // Icône pour passer en mode sombre
    } 
}

function toggleTheme() {
    if (currentTheme === 'auto') {
        currentTheme = 'dark';
    } else if (currentTheme === 'dark') {
        currentTheme = 'light';
    } else {
        currentTheme = 'auto';
    }

    // Sauvegarder la préférence utilisateur
    window.localStorage.setItem('theme', currentTheme);

    // Appliquer le thème choisi
    applyTheme(currentTheme);
}

// Appliquer le thème au chargement de la page
applyTheme(currentTheme);

// Ajout d'un écouteur d'événement pour le bouton de bascule du thème
themeToggle.addEventListener('click', toggleTheme);

// Gérer les changements de préférences système pour le mode automatique
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (currentTheme === 'auto') {
        applyTheme('auto'); // Réappliquer le mode automatique si activé
    }
});
