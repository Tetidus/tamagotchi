import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import SignUp from './components/SignUp';
import Tamagotchi from './components/Tamagotchi/Tamagotchi';
import Home from './pages/Home'



const App = () => {

  return (
    <>
      <div className="container">
        {/* <Tamagotchi />
        <SignUp />
        <hr />
        <Login /> */}

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
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
