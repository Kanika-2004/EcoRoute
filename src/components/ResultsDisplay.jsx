
import React, { useState } from "react";
import Fab from "@mui/material/Fab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function Results(props) {
  const [expand, setExpand] = useState(false);

  function isExpand() {
    setExpand(!expand);
  }

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
