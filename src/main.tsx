import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import '../src/index.css'
import Sidebar from "./sidebar.tsx";
import Calendar from "./calendar.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="flex"> 
    <Sidebar/>
    <App />
    <Calendar/>
    </div>
  </React.StrictMode>
);