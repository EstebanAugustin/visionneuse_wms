// Vérifie le thème actuel au chargement de la page
window.onload = function() {
    checkTheme();
};

// Fonction pour basculer entre les thèmes
function basculerTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    body.classList.toggle('dark-theme');

    // Sauvegarde le thème actuel dans le stockage local
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
}

// Fonction pour vérifier le thème au chargement de la page
function checkTheme() {
    const savedTheme = localStorage.getItem('theme');

    // Applique le thème sauvegardé s'il existe
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.add('light-theme');
    }
}
