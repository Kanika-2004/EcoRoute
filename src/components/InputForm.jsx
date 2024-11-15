
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Results from "./ResultsDisplay";
const CO2emissionFactors = {
  PetrolCar: 275.73,
  DieselCar: 271.02,
  ElectricCar: 277.25,
  ElectricBus: 275.51,
  DieselBus: 271.67,
  PetrolBus:271.05,
  PetrolMotorcycle: 278.99,
  DieselMotorcycle: 268.35,
  ElectricMotorcycle: 270.18,
  DieselTruck: 274.91,
  PetrolTruck: 269.98,
  ElectricTruck: 276.14
};

const NOXemissionFactors = {
  PetrolCar: 1.028296,
  DieselCar: 1.012286,
  ElectricCar: 1.056491,
  ElectricBus: 1.019805,
  DieselBus: 1.011685,
  PetrolBus: 1.048802,
  PetrolMotorcycle: 1.054025,
  DieselMotorcycle: 1.049142,
  ElectricMotorcycle: 1.039483,
  DieselTruck: 1.050560,
  PetrolTruck: 1.098321,
  ElectricTruck: 1.070077
};

const PMemissionFactors = {
  PetrolCar: 0.102834,
  DieselCar: 0.104781,
  ElectricCar: 0.105385,
  ElectricBus: 0.104198,
  DieselBus: 0.101257,
  PetrolBus: 0.102467,
  PetrolMotorcycle: 0.102876,
  DieselMotorcycle: 0.107399,
  ElectricMotorcycle: 0.107329,
  DieselTruck: 0.103281,
  PetrolTruck: 0.106955,
  ElectricTruck: 0.108868
};

function calculateEmissions(typeOfvehicle, distanceKm) {
  if (!CO2emissionFactors[typeOfvehicle]) {
    return `No data for vehicle type: ${typeOfvehicle}`;
  }

  const emissionsPerKmForCo2 = CO2emissionFactors[typeOfvehicle];
  const totalEmissionsCO2 = emissionsPerKmForCo2 * distanceKm;
  const emissionsPerKmForNOX = NOXemissionFactors[typeOfvehicle];
  const totalEmissionsNOX = emissionsPerKmForNOX * distanceKm;
  const emissionsPerKmForPM = PMemissionFactors[typeOfvehicle];
  const totalEmissionsPM = emissionsPerKmForPM * distanceKm;
  return {
    typeOfvehicle: typeOfvehicle,
    emissiondata:{
      co2:{
        totalEmissions:totalEmissionsCO2
      },
      nox:{
        totalEmissions:totalEmissionsNOX
      },
      particulate:{
        totalEmissions:totalEmissionsPM
      }

    }
  };
}

async function geocodeOfplace(locationName) {
  const apiKey = "5b3ce3597851110001cf62489f155caab8e3482d930c36a5fe187bed"; // Replace with your OpenRouteService API key
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
    locationName
  )}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error while geocoding! Status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    alert("No Results Found")
    return null; // Return null if no results are found
  }

  return data.features[0].geometry.coordinates; // [longitude, latitude]
}

async function calculateDist(start, end, mode, actualMode) {
  const apiKey = "5b3ce3597851110001cf62489f155caab8e3482d930c36a5fe187bed"; // Replace with your OpenRouteService API key
  const url = `https://api.openrouteservice.org/v2/directions/${mode}`;

  if (start[0] === end[0] && start[1] === end[1]) {
    return {
      distance: 0,
      duration: 0,
      mode: actualMode,
    };
  }

  const requestBody = {
    coordinates: [start, end], // [[lon1, lat1], [lon2, lat2]]
    format: "json",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `HTTP error while calculating distance! Status: ${response.status}, Message: ${errorData.message}`
    );
  }

  const data = await response.json();
  const route = data.routes[0];

  return {
    distance: (route.summary.distance / 1000).toFixed(2),
    duration: Math.round(route.summary.duration / 60), // Convert seconds to minutes and round to integer
    mode: actualMode,
  };
}

async function calculateForAllModes(locations) {
  const modes = {
    PetrolCar: "driving-car",
  DieselCar: "driving-car",
  ElectricCar:"driving-car",
  ElectricBus:"driving-hgv",
  DieselBus: "driving-hgv",
  PetrolBus:"driving-hgv",
  PetrolMotorcycle: "cycling-regular",
  DieselMotorcycle: "cycling-regular",
  ElectricMotorcycle:"cycling-regular",
  DieselTruck: "driving-hgv",
  PetrolTruck: "driving-hgv",
  ElectricTruck: "driving-hgv"
  };

  const allResults = [];
  for (const [mode, orsMode] of Object.entries(modes)) {
    const result = await calculateDist(locations[0], locations[1], orsMode, mode);
    allResults.push(result);
  }

  return allResults;
}

function InputForm() {
  const [place, setPlace] = useState({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [finalResult, setFinalResult] = useState([]);
  const [error, setError] = useState(""); // State to hold the error message
  // Function to handle input changes
  function handleChange(event) {
    const { name, value } = event.target;
    setPlace((prevPlace) => ({
      ...prevPlace,
      [name]: value,
    }));
    setFinalResult([]);
    setError(""); // Reset error message on input change
  }

  // Simulate form submission
  function handleSubmit(event) {
    event.preventDefault();
    setLocations([place.start, place.end]);
    setLoading(true);
    setShowResults(true);

    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }

  
  useEffect(() => {
    const fetchData = async () => {
      if (locations.length > 0) {
        try {
          const geocodedLocations = await Promise.all(
            locations.map((loc) => geocodeOfplace(loc))
          );
          if (geocodedLocations.includes(null)) {
            setError("No results found"); // Set error message
            return; // Stop further processing
          }

          const results = await calculateForAllModes(geocodedLocations);
          const totalData = [];

          results.forEach((result) => {
            let pollutionAmount = {};
            pollutionAmount=calculateEmissions(result.mode, parseFloat(result.distance));
           
            totalData.push({
              mode: result.mode,
              distance: result.distance,
              pollutionAmount,
              duration: result.duration,
            });
          });

          console.log("total data is",totalData)

          setFinalResult(totalData);

        } catch (error) {
          console.error("Error fetching geocoding or calculating results:", error);
          setError("An error occurred while fetching data."); // Handle any errors
        }
      }
    };

    fetchData();
  }, [locations]);

  return (
    <section id="form-section">
    <div>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div style={{fontWeight: 'bold', fontSize:'20px', color:'#123524'}}>Start Destination</div>
        <TextField
          name="start"
          onChange={handleChange}
          value={place.start}
          variant="outlined"
          placeholder="Place, City"
          sx={{ width: "80%", maxWidth: "400px", marginBottom: "16px",backgroundColor: " #AFEEEE",borderRadius: "10px" }}
        />

        <div style={{fontWeight: 'bold', fontSize:'20px', color:'#123524'}}>End Destination</div>
        <TextField
          name="end"
          
          onChange={handleChange}
          value={place.end}
         
          variant="outlined"
          placeholder="Place, City"
          sx={{ width: "80%", maxWidth: "400px", marginBottom: "16px",backgroundColor: " #AFEEEE",borderRadius: "10px" }}
        />
        


<LoadingButton
          loading={loading}
          loadingPosition="start"
          variant="contained"
          color="#123524"
          sx={{
            width: "100%",
            maxWidth: "400px",
            mt: 2,
            backgroundColor: "#f1ecca", // Apply the custom color here
            "&:hover": {
              backgroundColor: "#d4c08f",
              marginBottom: "16px" // Optional: Hover effect for better user experience
            },
          }}
          onClick={handleSubmit}
        >
          Submit
        </LoadingButton>
   
        
      </Box>

      {finalResult.length > 0 && (
        <dl className="dictionary" style={{ marginTop: "20px" }}> {/* Adjusted the margin to move results upwards */}
          {finalResult.map((resultTerm, index) => {
            let picture;
            switch (resultTerm.mode) {
              case "PetrolCar":
              case "DieselCar":
              case "ElectricCar":
                picture = "🚗";
                break;
              case "DieselBus":
              case "PetrolBus":
                case "ElectricBus":
                picture = "🚌";
                break;
              case "DieselMotorcycle":
                case "PetrolMotorcycle":
                  case "ElectricMotorcycle":
                picture = "🏍️";
                break;
              case "DieselTruck":
                case"PetrolTruck":
                case "ElectricTruck":
                picture = "🚚";
                break;
              default:
                picture = "🚗";
            }
            return (
              
              <Results
                key={index}
                mode={resultTerm.mode}
                distance={resultTerm.distance+" km"}
                co2Emissions={resultTerm?.pollutionAmount?.emissiondata?.co2?.totalEmissions.toFixed(4)+" gm"}
                noxEmissions={resultTerm?.pollutionAmount?.emissiondata?.nox?.totalEmissions.toFixed(4)+" gm"}
                particulateEmissions={resultTerm?.pollutionAmount?.emissiondata?.particulate?.totalEmissions.toFixed(4)+" gm"}
                time={resultTerm.duration+" min"}
                image={picture}
              />
            );
          })}
        </dl>
      )}

    </div>
    </section>
  );
}

export default InputForm;
