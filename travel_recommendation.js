// Global variables
let travelData = {};

// Keywords mapping
const keywordMap = {
    beach: ["beach", "beaches", "coast", "seaside", "shore"],
    temple: ["temple", "temples", "shrine", "pagoda", "sanctuary"],
    country: {
        japan: ["japan", "nippon"],
        brazil: ["brazil", "brasil"],
        australia: ["australia", "aussie", "oz"]
    }
};

// Timezone information
const timeZones = {
    "Australia": "Australia/Sydney",
    "Japan": "Asia/Tokyo",
    "Brazil": "America/Sao_Paulo"
};

// Load data when page loads
window.addEventListener('DOMContentLoaded', async () => {
    await loadTravelData();
    setupEventListeners();
});

// Load JSON file
async function loadTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        travelData = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        showMessage('Sorry, there was an error loading the data', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', performSearch);
    clearBtn.addEventListener('click', clearResults);
    
    // Search on Enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        showMessage('Please enter a search term', 'error');
        return;
    }

    const results = searchForRecommendations(query);
    displayResults(results);
}

// Search in data
function searchForRecommendations(query) {
    let results = [];

    // Search for beaches
    if (keywordMap.beach.some(keyword => query.includes(keyword))) {
        results = travelData.beaches || [];
        return { type: 'beaches', data: results };
    }

    // Search for temples
    if (keywordMap.temple.some(keyword => query.includes(keyword))) {
        results = travelData.temples || [];
        return { type: 'temples', data: results };
    }

    // Search for countries
    for (const [countryKey, aliases] of Object.entries(keywordMap.country)) {
        if (aliases.some(alias => query.includes(alias))) {
            const country = travelData.countries?.find(c => 
                c.name.toLowerCase().includes(countryKey)
            );
            if (country) {
                return { type: 'country', data: country };
            }
        }
    }

    // General search in all data
    const allResults = [];
    
    // Search in countries and their cities
    travelData.countries?.forEach(country => {
        if (country.name.toLowerCase().includes(query)) {
            allResults.push({ type: 'country', data: country });
        }
        country.cities?.forEach(city => {
            if (city.name.toLowerCase().includes(query) || 
                city.description.toLowerCase().includes(query)) {
                allResults.push({ type: 'city', data: city, country: country.name });
            }
        });
    });

    return { type: 'mixed', data: allResults };
}

// Display results
function displayResults(results) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    if (!results.data || (Array.isArray(results.data) && results.data.length === 0)) {
        showMessage('No results found', 'error');
        return;
    }

    switch (results.type) {
        case 'beaches':
        case 'temples':
            results.data.forEach(item => {
                resultsContainer.appendChild(createResultCard(item));
            });
            break;
            
        case 'country':
            // Display country info
            const countryInfo = createCountryCard(results.data);
            resultsContainer.appendChild(countryInfo);
            
            // Display cities
            results.data.cities?.forEach(city => {
                resultsContainer.appendChild(createResultCard(city, results.data.name));
            });
            break;
            
        case 'mixed':
            results.data.forEach(result => {
                if (result.type === 'country') {
                    resultsContainer.appendChild(createCountryCard(result.data));
                } else {
                    resultsContainer.appendChild(createResultCard(result.data, result.country));
                }
            });
            break;
    }
}

// Create result card
function createResultCard(item, countryName = null) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const imageUrl = item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
    
    let timeDisplay = '';
    if (countryName && timeZones[countryName]) {
        const localTime = getLocalTime(timeZones[countryName]);
        timeDisplay = `<div class="result-time">🕐 Local Time: ${localTime}</div>`;
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${item.name}" class="result-image">
        <div class="result-content">
            <h3 class="result-title">${item.name}</h3>
            <p class="result-description">${item.description}</p>
            ${timeDisplay}
        </div>
    `;
    
    return card;
}

// Create country card
function createCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const localTime = getLocalTime(timeZones[country.name]);
    
    card.innerHTML = `
        <div class="result-content">
            <h3 class="result-title">🌍 ${country.name}</h3>
            <p class="result-description">Explore the amazing cities in ${country.name}</p>
            <div class="result-time">🕐 Local Time: ${localTime}</div>
        </div>
    `;
    
    return card;
}

// Get local time
function getLocalTime(timeZone) {
    const options = {
        timeZone: timeZone,
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    
    return new Date().toLocaleTimeString('en-US', options);
}

// Clear results
function clearResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    const searchInput = document.getElementById('searchInput');
    
    resultsContainer.innerHTML = '';
    searchInput.value = '';
    searchInput.focus();
}

// Show message
function showMessage(message, type = 'info') {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = `
        <div class="message ${type === 'error' ? 'error-message' : ''}">
            ${message}
        </div>
    `;
}
