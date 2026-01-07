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
import Reading from "./pages/Reading";
import Dashboard from "./pages/Dashboard";
import NoPage from "./pages/NoPage";
import Login from "./pages/Login";
import Meals from "./pages/Meals";
import MDViewer from "./pages/MDViewer";
import OneChallenge from "./pages/OneChallenge";
import "./sass/styles.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faVimeo, faFontAwesome } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFolder,
  faFile,
  faEdit,
  faTimesCircle,
  faStar,
} from '@fortawesome/free-solid-svg-icons'; // Import specific solid icons

// Add the imported icons to the library
library.add(
  faFolder,
  faFile,
  faEdit,
  faTimesCircle,
  faStar,
  faFacebook,
  faInstagram,
  faTwitter,
  faVimeo
);

export default function App() {
  
  const { loginmessage, token, setToken } = Utils.useToken();

  if(token && token.name){

    return (
      <BrowserRouter>
        <Routes>
          
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/pictures" element={<Pictures authtf="true"/>} />
            <Route path="/pic" element={<SinglePic authtf="true"/>} />
            <Route path="/writing" element={<Writing doc=""/>} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/mdviewer" element={<MDViewer />} />
            <Route path="/onechallenge" element={<OneChallenge />} />
            
            
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
          <Route path="/pic" element={<SinglePic authtf="false"/>} />
          <Route path="/pictures" element={<Pictures authtf="false"/>} />
          <Route path="*" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="/writing" element={<Writing doc=""/>} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/meals" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="/mdviewer" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="/login" element={<Login loginmessage={loginmessage} setToken={setToken}/>} />
          <Route path="/onechallenge" element={<OneChallenge />} />

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

