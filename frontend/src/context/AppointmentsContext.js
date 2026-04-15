// AppointmentsContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  // ✅ Load appointments from localStorage initially
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem("appointments");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Save appointments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  // Add new appointment
  const addAppointment = (appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  };

  // Remove appointment
  const removeAppointment = (id) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

  return (
    <AppointmentsContext.Provider
      value={{ appointments, addAppointment, removeAppointment, setAppointments }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

// Custom hook
export const useAppointments = () => useContext(AppointmentsContext);

export default AppointmentsContext;
