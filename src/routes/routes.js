import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from '../hoc/mainLayout';
import Home from '../components/home'
import Login from '../components/login'
import RoomPartition from '../components/roomPartition'
import Landing from '../components/landing'
import { PublicRoute } from './privateRoute';
import Payment from '../components/payment';
import View from '../components/view3D'
import { getMemoizedBlueprint3dData } from "../redux/selectors/blueprint3d"

const AppRoutes = (props) => {


  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route
            path="/landing"
            element={
              <Landing />
            }
          />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>

          } />
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