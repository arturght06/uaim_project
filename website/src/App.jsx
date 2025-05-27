import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout/MainLayout";

import Home from "./pages/HomePage/Home";
import EventDetail from "./pages/Events/EventDetailPage/EventDetail";
import Login from "./pages/Auth/LoginPage/Login";
import Register from "./pages/Auth/RegisterPage/Register";
import Reservations from "./pages/ReservationsPage/Reservations";
import NotFound from "./pages/NotFoundPage/NotFound";
import User from "./pages/User/UserPage/User";
import EventCreate from "./pages/Events/EventCreatePage/EventCreate";
import EventEdit from "./pages/Events/EventEditPage/EventEdit";
import EditProfile from "./pages/User/EditProfilePage/EditProfile";
import Alert from "./components/UI/Alert/Alert";

function App() {
  return (
    <>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/edit/:eventId" element={<EventEdit />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/profile" element={<User />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
      <Alert></Alert>
    </>
  );
}

export default App;
