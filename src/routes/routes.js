import React, {useEffect} from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate} from 'react-router-dom';
import MainLayout from '../hoc/mainLayout';
import Home from '../components/home'
import Login from '../components/login'
import RoomPartition from '../components/roomPartition'
import Landing from '../components/landing'
import Payment from '../components/payment';
import View from '../components/view3D'

const AppRoutes = () => {
  const getCookie = (name) => {
    const nameEQ = `${name}=`;
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
      let cookie = cookiesArray[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  };

  useEffect(() => {
    const isAuthenticated = getCookie('isAuthenticated');

    if (!isAuthenticated && window.location.pathname !== '/sign-in') {
      window.location.href = '/sign-in';
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Router>
        <Routes>
          <Route path="/sign-in" element={<Login />} />
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route
            path="/landing"
            element={
              <Landing />
            }
          />
          <Route path="" element={<MainLayout />}>
            <Route
              path="/home"
              element={
                <Home />
              }
            />
            <Route
              path="/partition"
              element={
                <RoomPartition />
              }
            />
            <Route
              path="/three"
              element={<View />}
            />
            <Route
              path="/payment"
              element={<Payment />}
            />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default AppRoutes