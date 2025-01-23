import { postData, getData, patchData, deleteData } from './fetch/fetch.js';

// State management
let stains = [];
let currentTheme = 'auto';

// DOM Elements
const addStainModal = document.getElementById('addStainModal');
const confirmDialog = document.getElementById('confirmDialog');
const themeToggle = document.getElementById('themeToggle');

// Load and render stains
async function loadStains() {
   
    try {
        stains = await getData('stains');
        if (!stains) throw new Error('Failed to fetch stains');
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
    tbody.innerHTML = stainsToRender
        .map(stain => `
        <tr class="${stain.completed ? 'bg-gray-50' : ''}" 
            data-id="${stain.id}" 
            draggable="true" 
            ondragstart="startDrag(event)"
            ondragover="allowDrop(event)"
            ondrop="drop(event)">
            <td class="py-2 px-4">
                <input type="checkbox" ${stain.completed ? 'checked' : ''} 
                    onchange="toggleStainCompletion(${stain.id})"
                    class="w-4 h-4">
            </td>
            <td class="py-2 px-4 stain-name ${stain.completed ? 'line-through text-gray-500' : ''}" 
                ondblclick="startEditingStain(${stain.id})" data-id="${stain.id}">
                ${stain.name}
            </td>
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


// Toggle stain completion
window.toggleStainCompletion = async function (id) {
    try {
        const stain = stains.find(s => s.id == id);
        if (!stain) throw new Error(`Stain with id ${id} not found`);

        const updatedCompleted = !stain.completed;

        // Update locally
        stain.completed = updatedCompleted;
        filterAndRenderStains();

        // Update on server
        await patchData(`stains/${id}`, { completed: updatedCompleted });
    } catch (error) {
        console.error('Error toggling completion:', error);
        alert('Failed to update the task. Please try again.');
    }
};

// Enable editing of a stain
window.startEditingStain = function (id) {
    const stainElement = document.querySelector(`.stain-name[data-id="${id}"]`);
    const stain = stains.find(s => s.id == id);

    if (!stainElement || !stain) return;

    // Replace name with input
    stainElement.innerHTML = `
        <input type="text" value="${stain.name}" class="stain-edit-input border rounded w-full px-2 py-1">
    `;

    const inputElement = stainElement.querySelector('.stain-edit-input');
    inputElement.focus();

    // Save on blur or Enter key
    inputElement.addEventListener('blur', () => saveStainName(id, inputElement.value));
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveStainName(id, inputElement.value);
    });
};

// Save the updated name
async function saveStainName(id, newName) {
    const stain = stains.find(s => s.id == id);

    if (!stain || newName.trim() === '') return;

    // Update locally
    stain.name = newName.trim();
    filterAndRenderStains();

    // Update on server
    try {
        await patchData(`stains/${id}`, { name: newName.trim() });
    } catch (error) {
        console.error('Error updating stain name:', error);
        alert('Failed to update the task. Please try again.');
    }
}

// Delete stain
window.showDeleteConfirmation = function (id) {
    confirmDialog.classList.remove('hidden');

    document.getElementById('confirmYes').onclick = async () => {
        try {
            await deleteData(`stains/${id}`);
            confirmDialog.classList.add('hidden');
            await loadStains();
        } catch (error) {
            console.error('Error deleting stain:', error);
        }
    };

    document.getElementById('confirmNo').onclick = () => {
        confirmDialog.classList.add('hidden');
    };
};

// Search and filter handling
document.getElementById('searchInput').addEventListener('input', filterAndRenderStains);
document.getElementById('filterSelect').addEventListener('change', filterAndRenderStains);

// Add stain
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
            await postData(`stains`, { name, completed: false });
            document.getElementById('newStainName').value = '';
            addStainModal.classList.add('hidden');
            await loadStains();
        } catch (error) {
            console.error('Error adding stain:', error);
        }
    }
});

// Drag and drop handling
 window.startDrag= function (event) {
    event.dataTransfer.setData('text/plain', event.target.closest('tr').dataset.id);
}

window.allowDrop = function (event) {
    event.preventDefault();
}
window.drop = async function (event) {
    event.preventDefault();

    const draggedId = event.dataTransfer.getData('text/plain');
    const droppedId = event.currentTarget.dataset.id;

    const draggedIndex = stains.findIndex(s => s.id === draggedId);
    const droppedIndex = stains.findIndex(s => s.id === droppedId);

    if (draggedIndex === -1 || droppedIndex === -1) return;

    // Swap in local list
    [stains[draggedIndex], stains[droppedIndex]] = [stains[droppedIndex], stains[draggedIndex]];

    try {
        // Update each stain's order individually
        await patchData(`stains/${stains[draggedIndex].id}`, { order: draggedIndex  });
        await patchData(`stains/${stains[droppedIndex].id}`, { order: droppedIndex  });

        filterAndRenderStains();
    } catch (error) {
        console.error('Failed to update order on server:', error);
        alert('Failed to update the order. Please try again.');
    }
}


// Theme toggling
function toggleTheme() {
    const body = document.body;
    if (currentTheme === 'auto') {
        currentTheme = 'dark';
        body.classList.add('dark');
        themeToggle.textContent = '🌙';
    } else if (currentTheme === 'dark') {
        currentTheme = 'light';
        body.classList.remove('dark');
        themeToggle.textContent = '🌞';
    } else {
        currentTheme = 'auto';
        body.classList.remove('dark');
        themeToggle.textContent = '🌞/🌙';
    }
}

themeToggle.addEventListener('click', toggleTheme);

// Initial load
loadStains();