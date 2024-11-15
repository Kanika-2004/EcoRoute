import React from "react";
import features from "./predefinedData";

function Entry() {
  return (
    <div className="feature-section">
      {features.map((feature) => (
        <div className="feature-card" key={feature.id}>
          <img src={feature.image} alt={feature.title} />
          <div className="feature-title">{feature.title}</div>
          <div className="feature-description">{feature.description}</div>
          <a href={feature.link}>Know More</a>
        </div>
      ))}
    </div>
   
  );
}

export default Entry;
