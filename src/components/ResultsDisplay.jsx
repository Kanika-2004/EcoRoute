
import React, { useState } from "react";
import Fab from "@mui/material/Fab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";



function Results(props) {
  const [expand, setExpand] = useState(false);

  function isExpand() {
    setExpand(!expand);
  }

  const handleClick = (event) => {
    event.preventDefault(); // Prevent page refresh on link click
    window.open(props.link, "_blank"); // Open the link in a new tab
  };

  return (
    <div className="card" style={{backgroundColor:"#f1ecca"}} >
      <div className="card-header" style={{backgroundColor:"white"}} >
        <span className="emoji" role="img" aria-label="Mode of Transport">
          {props.image}
        </span>

        <div className="mode">{props.mode}</div>
      </div>

      <div className="card-body" >
        <div className="card-item">
          <strong>Distance:</strong> {props.distance}
        </div>
        {expand ? (
          <div>
            {" "}
            <div className="card-item">
              <strong>Time:</strong> {props.time}
            </div>
            <div className="card-item">
              <strong>CO2 Emissions:</strong> {props.co2Emissions}
            </div>{" "}
            <div className="card-item">
              <strong>NOX Emissions:</strong> {props.noxEmissions}
            </div>{" "}
            <div className="card-item">
              <strong>PM2.5 Emissions:</strong> {props.particulateEmissions}
            </div>{" "}
            {
  props.mode !== "DieselTruck" && props.mode !== "PetrolTruck" && props.mode !== "ElectricTruck" && (
    <div className="card-item">

<Box display="flex" justifyContent="center" width="100%" marginTop={2}>
  <Button 
    variant="contained" 
    color="success" // Green color
    onClick={handleClick}
  >
    Click For Booking
  </Button>
</Box>



    </div>
  )
}

          </div>
        ) : null}
        <Fab size="small" onClick={isExpand} aria-label="expand">
          {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Fab>
      </div>
    </div>
  );
}

export default Results;
