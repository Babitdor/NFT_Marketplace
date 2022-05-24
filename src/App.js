import React, { Component } from 'react';
import './App.css';
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";


export class App extends Component {
  render() {
    return (
     <Router>
        <div>
            <AppRoutes />
        </div>
      </Router>
    );
  }
}


export default App;
