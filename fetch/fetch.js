const BASE_URL = 'http://localhost:3000';

// Fonction générique GET
async function getData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Fonction générique POST
async function postData(endpoint, data) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
}

// Fonction PATCH optimisée
    async function patchData(endpoint, updateData) {
        try {
            const response = await fetch(`${BASE_URL}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }

// Fonction Delete Data
async function deleteData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}
export { getData, postData, patchData, deleteData };