import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import SignUp from './components/SignUp';
import Tamagotchi from './components/Tamagotchi/Tamagotchi';
import Home from './pages/Home'
import Shop from './pages/Shop';



const App = () => {

  return (
    <>

      <BrowserRouter>
        <Routes>
          <Route
            path="/*"
          >
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="tamagotchi" element={<Tamagotchi />} />
            <Route path="signUp" element={<SignUp />} />
            <Route path="login" element={<Login />} />
            <Route path="shop" element={<Shop />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
