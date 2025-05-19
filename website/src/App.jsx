import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout/MainLayout';

import Home from './pages/HomePage/Home';
import EventList from './pages/Events/EventListPage/EventList';
import EventDetail from './pages/Events/EventDetailPage/EventDetail';
import Login from './pages/Auth/LoginPage/Login';
import Register from './pages/Auth/RegisterPage/Register';
import Reservations from './pages/ReservationsPage/Reservations';
import NotFound from './pages/NotFoundPage/NotFound';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default App;