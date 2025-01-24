let currentTheme = window.localStorage.getItem('theme') || 'auto';

function applyTheme(theme) {
    const body = document.body;

    if (theme === 'dark') {
        body.classList.add('dark');
        body.classList.remove('light');
        themeToggle.textContent = '🌞'; 
    } else if (theme === 'light') {
        body.classList.add('light');
        body.classList.remove('dark');
        themeToggle.textContent = '🌙'; 
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
    
    window.localStorage.setItem('theme', currentTheme);

    applyTheme(currentTheme);
}

applyTheme(currentTheme);

themeToggle.addEventListener('click', toggleTheme);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (currentTheme === 'auto') {
        applyTheme('auto');
    }
});
