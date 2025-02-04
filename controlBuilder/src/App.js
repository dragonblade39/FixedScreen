import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainScreen from "./Components/MainScreen/MainScreen";
import LogsPage from "./Components/TreeView/LogsPage";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/logs" element={<LogsPage/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;