// Replace with your MapTiler API key
const mapTilerApiKey = 'mbfz4Kf5w1KFmN1gZefd';

// Mock data for Ayushman Kendra centers
const mockCenters = [
    {
        id: 12,
        name: "Ayushman Kendra - vit bhopal university",
        address: "kothri kalan vit bhopal university",
        phone: "+91 11 9876 5432",
        coordinates: { lat: 23.0775, lng: 76.8513 },
        distance: 0
    },
    {
        id: 1,
        name: "Ayushman Kendra - City Hospital",
        address: "123 Main Street, New Delhi",
        phone: "+91 11 2345 6789",
        coordinates: { lat: 28.6139, lng: 77.2090 },
        distance: 0
    },
    {
        id: 2,
        name: "Ayushman Kendra - Community Health Center",
        address: "456 Park Avenue, New Delhi",
        phone: "+91 11 8765 4321",
        coordinates: { lat: 28.6329, lng: 77.2195 },
        distance: 0
    },
    {
        id: 3,
        name: "Ayushman Kendra - District Hospital",
        address: "789 Hospital Road, New Delhi",
        phone: "+91 11 2468 1357",
        coordinates: { lat: 28.5921, lng: 77.2290 },
        distance: 0
    },
    {
        id: 4,
        name: "Ayushman Kendra - Primary Health Center",
        address: "321 Health Lane, New Delhi",
        phone: "+91 11 1357 2468",
        coordinates: { lat: 28.6508, lng: 77.2359 },
        distance: 0
    },
    {
        id: 5,
        name: "Ayushman Kendra - Medical College",
        address: "654 College Road, New Delhi",
        phone: "+91 11 9876 5432",
        coordinates: { lat: 28.6129, lng: 77.2295 },
        distance: 0
    },
    {
        id: 6,
        name: "Ayushman Kendra - Balaghat",
        address: "Shopno1 Patel Complex Novelty House Road Balaghat",
        phone: "+91 11 2345 6789",
        coordinates: { lat: 21.8129, lng: 80.1838 },
        distance: 0
    },
    {
        id: 7,
        name: "Ayushman Kendra - Mandsaur",
        address: "Kachriya Road Pipaliya Mandi Mandsaur",
        phone: "+91 11 8765 4321",
        coordinates: { lat: 24.1882, lng: 75.0085 },
        distance: 0
    },
    {
        id: 8,
        name: "Ayushman Kendra - Mandsaur",
        address: "MandsaurShop Noplot No01 Hospital Chourahabus Stand Roadgarothmandsour",
        phone: "+91 11 2468 1357",
        coordinates: { lat: 24.3281, lng: 75.6499 },
        distance: 0
    },
    {
        id: 9,
        name: "Ayushman Kendra - Ashoknagar",
        address: "Shop Noplot Noh N365 Ward No 12 Vidisa Road Ashok Nagar",
        phone: "+91 11 1357 2468",
        coordinates: { lat: 24.5775, lng: 77.7310 },
        distance: 0
    },
    {
        id: 10,
        name: "Ayushman Kendra - Bhopal",
        address: "Shop No6 Tarun Bazar Tulsi Nagar",
        phone: "+91 11 9876 5432",
        coordinates: { lat: 23.2599, lng: 77.4126 },
        distance: 0
    },
    {
        id: 11,
        name: "Ayushman Kendra - Bhopal",
        address: "Shop Noplot No 15 Siddhi Complex Vineet Kunj Sec Akolar Road Huzur",
        phone: "+91 11 9876 5432",
        coordinates: { lat: 23.2399, lng: 77.4291 },
        distance: 0
    }
];

let map;
let userMarker = null;
let centerMarkers = [];
let userLocation = null;
let centers = [...mockCenters];
let selectedCenterId = null;
let isLoading = false;
let geocoder = null;

// Initialize the map
function initMap() {
    // Hide the loading indicator
    document.getElementById('map-loading').style.display = 'none';

    // Default location (New Delhi)
    const defaultLocation = { lat: 23.2032, lng: 77.0844 };

    // Create the map
    map = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/streets/style.json?key=${mapTilerApiKey}`,
        center: [defaultLocation.lng, defaultLocation.lat],
        zoom: 12
    });

    // Add map controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    map.on('load', function () {
        // Try to get user's location
        getUserLocation();

        // Render the centers list
        renderCentersList();

        // Add event listeners
        document.getElementById('search-button').addEventListener('click', handleSearch);
        document.getElementById('location-button').addEventListener('click', getUserLocation);
        document.getElementById('search-input').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    });
}

// Get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Center the map on user's location
                map.flyTo({
                    center: [userLocation.lng, userLocation.lat],
                    zoom: 13
                });

                // Add user marker
                addUserMarker(userLocation);

                // Calculate distances and update centers
                updateCentersWithDistance(userLocation);

                // Render centers list
                renderCentersList();

                // Add center markers
                addCenterMarkers();

                setLoading(false);
            },
            (error) => {
                console.error("Error getting user location:", error);
                setLoading(false);

                // If geolocation fails, just show the centers without distances
                addCenterMarkers();
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        // If geolocation is not supported, just show the centers without distances
        addCenterMarkers();
    }
}

// Add user marker to the map
function addUserMarker(position) {
    // Remove existing user marker if any
    if (userMarker) {
        userMarker.remove();
        userMarker = null;
    }

    // Create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'user-marker';

    // Add marker to map
    userMarker = new maplibregl.Marker(el)
        .setLngLat([position.lng, position.lat])
        .addTo(map);

    // Add popup to marker
    new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
    })
        .setLngLat([position.lng, position.lat])
        .setHTML('<div class="popup-content"><div class="popup-title">Your Location</div></div>')
        .addTo(map);
}

// Add center markers to the map
function addCenterMarkers() {
    // Remove existing center markers
    centerMarkers.forEach(marker => marker.remove());
    centerMarkers = [];

    // Add markers for each center
    centers.forEach(center => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'center-marker';
        el.id = `marker-${center.id}`;

        // Add marker to map
        const marker = new maplibregl.Marker(el)
            .setLngLat([center.coordinates.lng, center.coordinates.lat])
            .setPopup(
                new maplibregl.Popup({ offset: 25 })
                    .setHTML(`
                                <div class="popup-content">
                                    <div class="popup-title">${center.name}</div>
                                    <div class="popup-address">${center.address}</div>
                                    <div class="popup-address">${center.phone}</div>
                                </div>
                            `)
            )
            .addTo(map);

        // Add click listener to marker
        el.addEventListener('click', () => {
            selectCenter(center.id);
        });

        centerMarkers.push(marker);
    });
}

// Calculate distance between user and centers
function updateCentersWithDistance(userPos) {
    centers = mockCenters.map(center => {
        const distance = calculateDistance(
            userPos.lat,
            userPos.lng,
            center.coordinates.lat,
            center.coordinates.lng
        );
        return { ...center, distance };
    });

    // Sort centers by distance
    centers.sort((a, b) => a.distance - b.distance);

    // Update centers count
    document.getElementById('centers-count').textContent =
        `${centers.length} centers found near your location`;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Handle search location
function handleSearch() {
    const searchQuery = document.getElementById('search-input').value.trim();
    if (!searchQuery) return;

    setLoading(true);

    // Using MapTiler Geocoding API
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${mapTilerApiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.features && data.features.length > 0) {
                const location = data.features[0];
                userLocation = {
                    lng: location.center[0],
                    lat: location.center[1]
                };

                // Center the map on search location
                map.flyTo({
                    center: [userLocation.lng, userLocation.lat],
                    zoom: 13
                });

                // Add user marker
                addUserMarker(userLocation);

                // Calculate distances and update centers
                updateCentersWithDistance(userLocation);

                // Render centers list
                renderCentersList();

                // Add center markers
                addCenterMarkers();
            } else {
                alert("Location not found. Please try a different search term.");
            }

            setLoading(false);
        })
        .catch(error => {
            console.error("Error searching location:", error);
            alert("Error searching location. Please try again.");
            setLoading(false);
        });
}

// Render the centers list
function renderCentersList() {
    const centersList = document.getElementById('centers-list');
    centersList.innerHTML = '';

    centers.forEach(center => {
        const centerCard = document.createElement('div');
        centerCard.className = `center-card ${selectedCenterId === center.id ? 'selected' : ''}`;
        centerCard.id = `center-${center.id}`;

        centerCard.innerHTML = `
                    <div class="center-header">
                        <div class="center-name">${center.name}</div>
                        ${userLocation ? `<div class="center-distance">${center.distance.toFixed(1)} km</div>` : ''}
                    </div>
                    <div class="center-address">${center.address}</div>
                    <div class="center-phone">${center.phone}</div>
                    <div class="center-divider"></div>
                `;

        centerCard.addEventListener('click', () => {
            selectCenter(center.id);
        });

        centersList.appendChild(centerCard);
    });
}

// Select a center
function selectCenter(centerId) {
    selectedCenterId = centerId;

    // Update selected class in the list
    document.querySelectorAll('.center-card').forEach(card => {
        card.classList.remove('selected');
    });

    const selectedCard = document.getElementById(`center-${centerId}`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Find the center and pan to it
    const center = centers.find(c => c.id === centerId);
    if (center && map) {
        map.flyTo({
            center: [center.coordinates.lng, center.coordinates.lat],
            zoom: 15
        });

        // Open popup for the selected center
        const marker = centerMarkers.find((_, index) => centers[index].id === centerId);
        if (marker) {
            marker.togglePopup();
        }
    }
}

// Set loading state
function setLoading(loading) {
    isLoading = loading;
    const loadingElement = document.getElementById('map-loading');

    if (loading) {
        loadingElement.style.display = 'flex';
    } else {
        loadingElement.style.display = 'none';
    }
}

// Fallback function if MapTiler Map fails to load
function handleMapError() {
    const mapContainer = document.getElementById('map');
    const loadingElement = document.getElementById('map-loading');

    loadingElement.innerHTML = `
                <div>
                    <h3>MapTiler Map could not be loaded</h3>
                    <p>Please check your API key and try again.</p>
                </div>
            `;
}

// Initialize map when the page loads
window.onload = function () {
    try {
        initMap();
    } catch (error) {
        console.error("Error initializing map:", error);
        handleMapError();
    }
};
