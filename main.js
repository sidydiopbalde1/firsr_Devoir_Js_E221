import {getData, patchData} from './fetch/fetch.js';
const API_URL = 'http://localhost:3000';

// State management
let currentUser = null;
let stains = [];

// DOM Elements
const loginPage = document.getElementById('loginPage');
const listPage = document.getElementById('listPage');
const addStainModal = document.getElementById('addStainModal');
const confirmDialog = document.getElementById('confirmDialog');

// Login handling
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users?login=${login}&password=${password}`);
        const users = await response.json();

        if (users.length > 0) {
            currentUser = users[0];
            showListPage();
            loadStains();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

// Stains list handling
async function loadStains() {
    try {
         stains = await getData(`stains`);
        console.log('Stains',stains);
        if (!stains) {
            throw new Error('Failed to fetch stains');
        }
        
        filterAndRenderStains();
    } catch (error) {
        console.error('Error loading stains:', error);
        alert('Failed to load tasks. Please refresh the page.');
    }
}

function filterAndRenderStains() {
    const filterValue = document.getElementById('filterSelect').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredStains = stains.filter(stain => 
        stain.name.toLowerCase().includes(searchValue)
    );

    if (filterValue !== 'all') {
        filteredStains = filteredStains.filter(stain => 
            filterValue === 'completed' ? stain.completed : !stain.completed
        );
    }

    renderStainsList(filteredStains);
}

function renderStainsList(stainsToRender) {
    const tbody = document.getElementById('stainsList');
    tbody.innerHTML = stainsToRender.map(stain => `
        <tr class="${stain.completed ? 'bg-gray-50' : ''}">
            <td class="py-2 px-4">
                <input type="checkbox" ${stain.completed ? 'checked' : ''} 
                       onchange="toggleStainCompletion(${stain.id})"
                       class="w-4 h-4">
            </td>
            <td class="py-2 px-4 ${stain.completed ? 'line-through text-gray-500' : ''}">${stain.name}</td>
            <td class="py-2 px-4">
                <span class="px-2 py-1 rounded text-sm ${stain.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${stain.completed ? 'Complete' : 'Incomplete'}
                </span>
            </td>
            <td class="py-2 px-4">
                <button onclick="editStain(${stain.id})" class="mr-2 hover:text-blue-600">✏️</button>
                <button onclick="showDeleteConfirmation(${stain.id})" class="text-red-500 hover:text-red-600">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function toggleStainCompletion(id) {
    try {
        // Récupérer l'objet à mettre à jour
        const response = await fetch(`${API_URL}/stains`);
        if (!response.ok) {
            throw new Error(`Stain with id ${id} not found`);
        }

        const stains = await response.json();
        const stain = stains.find(s => s.id === id);
        if (!stain) {
            throw new Error(`Stain with id ${id} not found`);
        }

        const updatedStain = { ...stain, completed: !stain.completed };

        // Mise à jour optimiste
        const stainIndex = stains.findIndex(s => s.id === id);
        if (stainIndex !== -1) {
            stains[stainIndex] = updatedStain;
            filterAndRenderStains(); // Rafraîchir l'interface
        }

        // Envoi de la mise à jour au serveur
        const updateResponse = await fetch(`${API_URL}/stains/${id}`, {
            method: 'PATCH', 
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ completed: updatedStain.completed })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Error from server:', errorText);
            throw new Error('Failed to update stain');
        }

        // Rechargement des données après la mise à jour
        await loadStains();

    } catch (error) {
        console.error('Error toggling completion:', error);
        alert('Failed to update the task. Please try again.');
        await loadStains(); // Retour à l'état initial
    }
}


// Modal handling
document.getElementById('addStainBtn').addEventListener('click', () => {
    addStainModal.classList.remove('hidden');
});

document.getElementById('closeAddModal').addEventListener('click', () => {
    addStainModal.classList.add('hidden');
    document.getElementById('newStainName').value = '';
});

document.getElementById('submitStain').addEventListener('click', async () => {
    const name = document.getElementById('newStainName').value;
    if (name) {
        try {
            await fetch(`${API_URL}/stains`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    completed: false 
                })
            });
            document.getElementById('newStainName').value = '';
            addStainModal.classList.add('hidden');
            loadStains();
        } catch (error) {
            console.error('Error adding stain:', error);
        }
    }
});

// Search and filter handling
document.getElementById('searchInput').addEventListener('input', filterAndRenderStains);
document.getElementById('filterSelect').addEventListener('change', filterAndRenderStains);

// Delete confirmation
function showDeleteConfirmation(id) {
    confirmDialog.classList.remove('hidden');
    
    document.getElementById('confirmYes').onclick = async () => {
        try {
            await fetch(`${API_URL}/stains/${id}`, { method: 'DELETE' });
            confirmDialog.classList.add('hidden');
            loadStains();
        } catch (error) {
            console.error('Error deleting stain:', error);
        }
    };
    
    document.getElementById('confirmNo').onclick = () => {
        confirmDialog.classList.add('hidden');
    };
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', function() {
    this.textContent = this.textContent === '🌞' ? '🌙' : '🌞';
    document.body.classList.toggle('dark');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    listPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
});

// Helper functions
function showListPage() {
    loginPage.classList.add('hidden');
    listPage.classList.remove('hidden');
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addStainModal) {
        addStainModal.classList.add('hidden');
    }
    if (e.target === confirmDialog) {
        confirmDialog.classList.add('hidden');
    }
});

async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}