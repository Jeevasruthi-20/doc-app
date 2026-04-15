import React, { useState } from "react";
import { useAppointments } from "../context/AppointmentsContext";
import "./Appointments.css";
import Modal from "react-modal";

const Appointments = () => {
  const { appointments, setAppointments } = useAppointments();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    doctor: "",
    date: "",
    time: "",
    type: "in-person",
    reason: ""
  });
  const [bookingError, setBookingError] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: "cancelled" } : apt
      ));
    }
  };

  const handleRescheduleAppointment = (id) => {
    alert(`Rescheduling appointment ${id}. This would open a rescheduling form.`);
  };

  const filteredAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    const now = new Date();
    if (activeTab === "upcoming") {
      return (apt.status === "confirmed" || apt.status === "pending") && appointmentDateTime > now;
    } else if (activeTab === "past") {
      return appointmentDateTime <= now || apt.status === "cancelled";
    }
    return true;
  });

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenBookingModal = () => {
    setShowBookingModal(true);
    setBookingError("");
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setBookingData({ doctor: "", date: "", time: "", type: "in-person", reason: "" });
    setBookingError("");
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError("");
    const selectedDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
    if (selectedDateTime <= new Date()) {
      setBookingError("Please select a future date and time.");
      return;
    }
    // Add API call to backend here
    // Example:
    // const res = await fetch("/api/appointments", { method: "POST", body: JSON.stringify({ ...bookingData }) })
    // ...handle response...
    setShowBookingModal(false);
  };

  return (
    <div className="appointments-page">
      <div className="container">
        <div className="appointments-header">
          <h1 className="section-title">My Appointments</h1>
          <p className="appointments-subtitle">
            Manage your upcoming and past appointments
          </p>
        </div>

        <div className="appointments-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({appointments.filter(apt => apt.status === "confirmed" || apt.status === "pending").length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({appointments.filter(apt => apt.status === "cancelled").length})
          </button>
        </div>

        <div className="appointments-content">
          {filteredAppointments.length === 0 ? (
            <div className="no-appointments">
              <div className="no-appointments-icon">📅</div>
              <h3>No appointments found</h3>
              <p>
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments. Book one now!" 
                  : "No past appointments to display."
                }
              </p>
              {activeTab === 'upcoming' && (
                <button className="btn primary-btn" onClick={handleOpenBookingModal}>
                  Book New Appointment
                </button>
              )}
            </div>
          ) : (
            <div className="appointments-list">
              {filteredAppointments.map((appointment) => (
                <div className="appointment-card card" key={appointment.id}>
                  <div className="appointment-header">
                    <div className="appointment-info">
                      <h3 className="doctor-name">{appointment.doctorName}</h3>
                      <p className="specialty">{appointment.specialty}</p>
                    </div>
                    <div className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">⏰</span>
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{appointment.time}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon">🏥</span>
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{appointment.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    {appointment.status === "confirmed" && (
                      <>
                        <button 
                          className="btn secondary-btn"
                          onClick={() => handleRescheduleAppointment(appointment.id)}
                        >
                          Reschedule
                        </button>
                        <button 
                          className="btn secondary-btn"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === "pending" && (
                      <button 
                        className="btn secondary-btn"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    )}
                    {appointment.status === "cancelled" && (
                      <button className="btn primary-btn">
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="appointments-summary">
          <div className="summary-card">
            <h3>Appointment Summary</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-number">{appointments.filter(apt => apt.status === "confirmed").length}</span>
                <span className="stat-label">Confirmed</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{appointments.filter(apt => apt.status === "pending").length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{appointments.filter(apt => apt.status === "cancelled").length}</span>
                <span className="stat-label">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showBookingModal}
        onRequestClose={handleCloseBookingModal}
        contentLabel="Book Appointment"
        ariaHideApp={false}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <form onSubmit={handleBookAppointment} className="booking-form">
          <h2>Book Appointment</h2>
          <label>
            Doctor:
            <input type="text" name="doctor" value={bookingData.doctor} onChange={handleBookingInputChange} required />
          </label>
          <label>
            Date:
            <input type="date" name="date" value={bookingData.date} onChange={handleBookingInputChange} required />
          </label>
          <label>
            Time:
            <input type="time" name="time" value={bookingData.time} onChange={handleBookingInputChange} required />
          </label>
          <label>
            Type:
            <select name="type" value={bookingData.type} onChange={handleBookingInputChange} required>
              <option value="in-person">In Person</option>
              <option value="video-call">Video Call</option>
            </select>
          </label>
          <label>
            Reason:
            <input type="text" name="reason" value={bookingData.reason} onChange={handleBookingInputChange} required />
          </label>
          {bookingError && <div className="error-msg">{bookingError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn secondary-btn" onClick={handleCloseBookingModal}>Cancel</button>
            <button type="submit" className="btn primary-btn">Book</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
