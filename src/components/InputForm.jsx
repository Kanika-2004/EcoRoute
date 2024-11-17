
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Results from "./ResultsDisplay";
const CO2emissionFactors = {
  DieselMotorcycle: 268.35,
PetrolTruck: 269.98,
ElectricMotorcycle: 270.18,
DieselCar: 271.02,
PetrolBus: 271.05,
DieselBus: 271.67,
PetrolCar: 275.73,
DieselTruck: 274.91,
ElectricBus: 275.51,
ElectricCar: 277.25,
ElectricTruck: 276.14,
PetrolMotorcycle: 278.99,
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
    duration: (route.summary.duration / 60).toFixed(2), // Convert seconds to minutes and round to integer
    mode: actualMode,
  };
}

async function calculateForAllModes(locations) {
  const modes = { 
PetrolTruck: "driving-hgv",
DieselCar: "driving-car",
PetrolBus: "driving-hgv",
DieselBus: "driving-hgv",
PetrolCar: "driving-car",
DieselTruck: "driving-hgv",
ElectricBus: "driving-hgv",
ElectricCar: "driving-car",
ElectricTruck: "driving-hgv",
DieselMotorcycle: "cycling-regular",
ElectricMotorcycle: "cycling-regular",
PetrolMotorcycle:"cycling-regular"
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
  const [error, setError] = useState(""); 
  const [minimumCO2Mode, setMinimumCO2Mode] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setPlace((prevPlace) => ({
      ...prevPlace,
      [name]: value,
    }));
    setFinalResult([]);
    setError(""); 
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
         const sorteddata= totalData.sort((a, b) => {
            if (a.duration === b.duration) {
              return (a.pollutionAmount.emissiondata.co2.totalEmissions - b.pollutionAmount.emissiondata.co2.totalEmission);   
         }         
            return a.duration - b.duration;
          });

          
          console.log("sorted data is",sorteddata)
          setFinalResult(sorteddata);



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
        <div style={{fontWeight: 'bold', fontSize:'20px', color:'white'}}>Start Destination</div>
        <TextField
          name="start"
          onChange={handleChange}
          value={place.start}
          variant="outlined"
          placeholder="Place, City"
          sx={{ width: "80%", maxWidth: "400px", marginBottom: "16px",backgroundColor: " #f1ecca",borderRadius: "10px" }}
        />

        <div style={{fontWeight: 'bold', fontSize:'20px', color:'white'}}>End Destination</div>
        <TextField
          name="end"
          
          onChange={handleChange}
          value={place.end}
         
          variant="outlined"
          placeholder="Place, City"
          sx={{ width: "80%", maxWidth: "400px", marginBottom: "16px",backgroundColor: " #f1ecca",borderRadius: "10px" }}
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
            color: "white",
            backgroundColor: "rgb(97,215,97)", 
            fontWeight: "bold",
            "&:hover": {
              color:"rgb(97,215,97)",
              backgroundColor: "white",
              marginBottom: "16px" 
            },
          }}
          onClick={handleSubmit}
        >
          Submit
        </LoadingButton>
   
        
      </Box>

      {finalResult.length > 0 && (
        <dl className="dictionary" style={{ marginTop: "20px" }}> 
          {finalResult.map((resultTerm, index) => {
            let picture;
            let link;
            switch (resultTerm.mode) {
              case "PetrolCar":
              case "DieselCar":
              case "ElectricCar":
                picture = "🚗";
                link="https://www.uber.com/in/en/?gad_source=1&gclid=Cj0KCQiAouG5BhDBARIsAOc08RTJrEibMjhAYyFu7dJM9KNQU8aCGfY8avHrk3rEUsM0xWqtsNq-lpAaAtezEALw_wcB"
                break;
              case "DieselBus":
              case "PetrolBus":
                case "ElectricBus":
                picture = "🚌";
                link="https://www.redbus.in/?gad_source=1&gclid=Cj0KCQiAouG5BhDBARIsAOc08RSwvmqCoxIF1T0dJnoKeNTuxsKuiV3UYPhyt0g8wUHMX_vKryR80hUaAlO6EALw_wcB"
                break;
              case "DieselMotorcycle":
                case "PetrolMotorcycle":
                  case "ElectricMotorcycle":
                picture = "🏍️";
                link="https://www.rapido.bike/"
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
                link={link}
                
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
