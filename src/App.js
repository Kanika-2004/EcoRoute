import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState,useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import InputForm from "./components/InputForm";
import Results from "./components/ResultsDisplay";
import travelModes from "./components/data";
import Entry from "./components/Features";
import { Banner } from "./components/heroSection";


export default function App() {
  useEffect(() => {
    document.title = "EcoRoute";
  }, []);
  return (
    <div>
      <Header />
      <Banner/>     
      <Entry />
      <InputForm />
      <Footer />
    </div>
  );
}
