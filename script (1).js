// emission factors in gm/km
const emissionFactors = {
    PetrolCar: 0.5,
    Walk: 0,
    Bicycle: 0,
    DieselCar: 0.5,
    CngCar: 0.6,
    Scooter: 1.0,
    Motorcycle: 1.0,
    DieselBus: 1.0,
    CngBus: 0.6,
    AutoPetrol: 1.0,
    AutoCng: 0.6,
    Truck: 1.0
};

function calculateEmissions(typeOfvehicle, distanceKm) {
    if (!emissionFactors[typeOfvehicle]) {
        return `No data for vehicle type: ${typeOfvehicle}`;
    }

    const emissionsPerKm = emissionFactors[typeOfvehicle];
    const totalEmissions = emissionsPerKm * distanceKm;
    return {
        typeOfvehicle: typeOfvehicle,
        distanceTraveled: distanceKm + ' km',
        totalEmissions: (totalEmissions).toFixed(6) + ' gm CO'
    };
}

async function geocodeOfplace(locationName) {
    const apiKey = '850dd56240b74002a4ab58bf02c22b7b'; // Replace with your Geoapify API key
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(locationName)}&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error while geocoding! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.features.length === 0) {
        throw new Error(`No results found for "${locationName}"`);
    }

    return data.features[0].geometry.coordinates; // [longitude, latitude]
}

// Function to calculate distance and duration using Geoapify Route Matrix API for different modes
async function calculateDist(locations, mode, actualmode) {
    const apiKey = '850dd56240b74002a4ab58bf02c22b7b'; // Replace with your Geoapify API key
    const url = `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`;

    const waypoints = locations.map(loc => ({
        location: [loc[0], loc[1]] // [lon, lat] format
    }));

    const requestBody = {
        mode: mode, // Dynamic mode based on input
        sources: waypoints,
        targets: waypoints // Use the same waypoints for both sources and targets
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error while calculating distance! Status: ${response.status}, Message: ${errorData.message}`);
    }

    const data = await response.json();
    const distances = data.sources_to_targets;
    const durations = data.sources_to_targets;

    const results = [];

    for (let i = 0; i < distances.length; i++) {
        for (let j = 0; j < distances[i].length; j++) {
            if (i != j && i < j) {
                results.push({
                    sourceIndex: i,
                    targetIndex: j,
                    distance: (distances[i][j].distance / 1000).toFixed(2),
                    duration: (durations[i][j].time / 60).toFixed(2),
                    mode: actualmode
                });
            }
        }
    }

    return results;
}

async function calculateForAllModes(locations) {
    const modes = ['PetrolCar', 'DieselCar', 'DieselBus', 'CngBus', 'AutoPetrol', 'AutoCng', 'CngCar', 'ElectricCar', 'Walk', 'Scooter', 'Motorcycle', 'Truck', 'Bicycle'];
    const allResults = [];

    for (const mode of modes) {
        let results;
        if (mode === 'PetrolCar' || mode === 'DieselCar' || mode === 'AutoPetrol' || mode === 'AutoCng' || mode === 'CngCar' || mode === 'ElectricCar') 
            results = await calculateDist(locations, 'drive', mode);
        else if (mode === 'DieselBus' || mode === 'CngBus') 
            results = await calculateDist(locations, 'bus', mode);
        else {
            const str = mode.charAt(0).toLowerCase() + mode.slice(1);
            results = await calculateDist(locations, str, mode);
        }
        allResults.push(...results);
    }

    return allResults;
}

document.getElementById('distance-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const locations = [
        document.getElementById('start').value,
        document.getElementById('end').value,
    ];

    try {
        // Show spinner when processing starts
        document.getElementById('spinner').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display='none'

        const geocodedlocation = await Promise.all(locations.map(loc => geocodeOfplace(loc)));
        console.log(geocodedlocation);

        const results = await calculateForAllModes(geocodedlocation);
        const totaldata = [];

        const resultText = results.map(result => {
            let pollutionamount = '';

            if (['Scooter', 'PetrolCar', 'DieselBus', 'CngBus', 'AutoPetrol', 'AutoCng', 'DieselCar', 'CngCar', 'DieselBus', 'CngBus', 'Motorcycle', 'bus', 'Truck'].includes(result.mode)) {
                const typeOfvehicle = result.mode === 'drive' ? 'DieselCar' : result.mode;
                const emissions = calculateEmissions(typeOfvehicle, parseFloat(result.distance));
                pollutionamount = emissions.totalEmissions;
            } else if (['Bicycle', 'Walk', 'ElectricCar'].includes(result.mode)) {
                pollutionamount = 0;
            }

            let obj = {};
            obj.mode = result.mode;
            obj.distance = result.distance;
            obj.pollutionamount = pollutionamount;
            obj.duration = result.duration;

            console.log("object is", obj);
            totaldata.push(obj);

            return `Mode: ${result.mode.toUpperCase()}
                Distance: ${result.distance} km, 
                Duration: ${result.duration} minutes
                ${pollutionamount}`;
        }).join('\n');

        console.log("result text", totaldata);

        const sortedData = totaldata.sort((a, b) => {
            const pollutionA = parseFloat(a.pollutionamount) || 0; // Fallback to 0 for non-motorized
            const pollutionB = parseFloat(b.pollutionamount) || 0; // Fallback to 0 for non-motorized
            return pollutionA - pollutionB; // Ascending order
        });

        console.log("Sorted data by pollution amount:", sortedData);

        let tableelement = `<table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Travelling Time (min)</th>
                    <th scope="col">CO₂ Emission</th>
                </tr>
            </thead>
            <tbody class="table-group-divider">`;

        sortedData.forEach((item) => {
            tableelement += `
                <tr>
                    <th scope="row">${item.mode}</th>
                    <td>${item.duration}</td>
                    <td>${item.pollutionamount}</td>
                </tr>`;
        });

        tableelement += `</tbody></table>`;

        document.getElementById('result').innerHTML = tableelement;

        // Hide spinner after results are displayed
        document.getElementById('spinner').style.display = 'none';
         document.getElementById('submitBtn').style.display='inline-block'

    } catch (error) {
        console.log("Error is here", error.message);
        // Hide spinner in case of an error too
        document.getElementById('spinner').style.display = 'none';
       
    }
});

function showSpinner(event) {
    event.preventDefault(); // Prevent the default form submission
    document.getElementById('spinner').style.display = 'inline-block'; // Show spinner
    
}
