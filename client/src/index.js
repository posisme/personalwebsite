import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Utils from './utils/Utils';


import Home from "./pages/Home";
import About from "./pages/About";
import Videos from "./pages/Videos";
import Pictures from "./pages/Pictures";
import SinglePic from "./pages/SinglePic";
import Writing from "./pages/Writing";
import Dashboard from "./pages/Dashboard";
import NoPage from "./pages/NoPage";
import Login from "./pages/Login";
import Meals from "./pages/Meals";
import "./sass/styles.scss";


export default function App() {
  
  const { loginmessage, token, setToken } = Utils.useToken();

  if(token && token.name){

    return (
      <BrowserRouter>
        <Routes>
          
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/pictures" element={<Pictures />} />
            <Route path="/pic" element={<SinglePic />} />
            <Route path="/writing" element={<Writing doc=""/>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meals" element={<Meals />} />
            
            
            <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    );
  }
  else{
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/pictures" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="/pic" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="*" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="/writing" element={<Writing doc=""/>} />
          <Route path="/meals" element={<Meals />} />
        </Routes>
      </BrowserRouter>
      )
  }
  
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
  </>
);

