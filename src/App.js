import React, { useState } from "react";
import "./styles.css";

const App = () => {
  const [formData, setFormData] = useState({
    firstName: "Crio",
    lastName: "Beaver",
    email: "beaver@criodo.com",
    doctor: "",
    meetingType: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  const [errors, setErrors] = useState({});
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const doctors = [
    "Dr. John Hopkins",
    "Dr. Smith",
    "Dr. Johnson",
    "Dr. Williams",
    "Dr. Brown",
    "Dr. Jones",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.doctor) {
      newErrors.doctor = "Please select a doctor";
    }

    if (formData.doctor) {
      if (!formData.meetingType) {
        newErrors.meetingType = "Please select a meeting type";
      }

      if (!formData.appointmentDate) {
        newErrors.appointmentDate = "Please select a date";
      }

      if (!formData.appointmentTime) {
        newErrors.appointmentTime = "Please select a time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "doctor") {
      setShowAdditionalOptions(!!value);
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCancelAppointment = () => {
    setBookingConfirmed(false);
    setApiResponse(null);
    setBookingDetails(null);
    setFormData({
      firstName: "Crio",
      lastName: "Beaver",
      email: "beaver@criodo.com",
      doctor: "",
      meetingType: "",
      appointmentDate: "",
      appointmentTime: "",
    });
    setShowAdditionalOptions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const payload = {
          userId: 1,
          title: `Appointment with ${formData.doctor}`,
          body: JSON.stringify({
            patientName: `${formData.firstName} ${formData.lastName}`,
            patientEmail: formData.email,
            doctor: formData.doctor,
            meetingType:
              formData.meetingType === "google-meet"
                ? "Google Meet"
                : "Phone Call",
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            bookedAt: new Date().toISOString(),
          }),
        };

        // Simulate network delay for better UX (remove in production)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        setApiResponse(data);
        setBookingDetails({
          ...formData,
          bookingId: data.id,
          confirmationNumber: `CONF-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`,
        });
        setBookingConfirmed(true);
      } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Failed to book appointment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${displayHour}:00 ${period}`);
      if (hour !== 17) {
        slots.push(`${displayHour}:30 ${period}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Success View Component
  if (bookingConfirmed && bookingDetails) {
    return (
      <div className="appointment-container">
        <div className="success-view">
          <div className="success-banner">
            <div className="success-icon">✓</div>
            <div className="success-content">
              <h2>Appointment booked successfully!</h2>
              <p className="confirmation-number">
                Confirmation #: {bookingDetails.confirmationNumber}
              </p>
            </div>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>

            <div className="summary-card">
              <div className="summary-section">
                <h4>Patient Information</h4>
                <p>
                  <strong>Name:</strong> {bookingDetails.firstName}{" "}
                  {bookingDetails.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {bookingDetails.email}
                </p>
              </div>

              <div className="summary-section">
                <h4>Appointment Details</h4>
                <p>
                  <strong>Doctor:</strong> {bookingDetails.doctor}
                </p>
                <p>
                  <strong>Meeting Type:</strong>{" "}
                  {bookingDetails.meetingType === "google-meet"
                    ? "Google Meet"
                    : "Phone Call"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(bookingDetails.appointmentDate)}
                </p>
                <p>
                  <strong>Time:</strong> {bookingDetails.appointmentTime}
                </p>
              </div>

              <div className="summary-section">
                <h4>Additional Information</h4>
                <p>
                  <strong>Booking ID:</strong> {bookingDetails.bookingId}
                </p>
                <p>
                  <strong>Booked on:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="success-actions">
              <button className="cancel-btn" onClick={handleCancelAppointment}>
                Cancel appointment
              </button>

              <button
                className="secondary-btn"
                onClick={() => {
                  // You could implement download or email functionality here
                  alert("Booking details would be sent to your email");
                }}
              >
                Send details to email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="appointment-container">
        <h1>Book a session</h1>
        <p className="subtitle">
          Fill in the form below to book a virtual session with your doctor
        </p>

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-message">Scheduling the appointment...</div>
          <div className="loading-submessage">
            Please wait while we confirm your booking
          </div>
        </div>

        <div className="loading-details">
          <p>
            Booking appointment with: <strong>{formData.doctor}</strong>
          </p>
          <p>
            For:{" "}
            <strong>
              {formData.firstName} {formData.lastName}
            </strong>
          </p>
          <p>
            Date: <strong>{formatDate(formData.appointmentDate)}</strong>
          </p>
          <p>
            Time: <strong>{formData.appointmentTime || "TBD"}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Booking Form (Default View)
  return (
    <div className="appointment-container">
      <h1>Book a session</h1>
      <p className="subtitle">
        Fill in the form below to book a virtual session with your doctor
      </p>

      {apiResponse && (
        <div className="api-response-banner">
          <strong>✓ Booking Confirmed!</strong> (Demo: API Response ID:{" "}
          {apiResponse.id})
        </div>
      )}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-section">
          <h2>Basic Info</h2>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? "error" : ""}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? "error" : ""}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Doctor</h2>

          <div className="form-group">
            <label htmlFor="doctor">Select your doctor</label>
            <select
              id="doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleInputChange}
              className={errors.doctor ? "error" : ""}
            >
              <option value="">Select your doctor ▼</option>
              {doctors.map((doctor, index) => (
                <option key={index} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
            {errors.doctor && (
              <span className="error-message">{errors.doctor}</span>
            )}
          </div>
        </div>

        {showAdditionalOptions && (
          <>
            <div className="form-section additional-options">
              <h2>Where?</h2>

              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="meetingType"
                    value="google-meet"
                    checked={formData.meetingType === "google-meet"}
                    onChange={handleInputChange}
                  />
                  <span className="radio-custom"></span>
                  Google Meet
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="meetingType"
                    value="phone"
                    checked={formData.meetingType === "phone"}
                    onChange={handleInputChange}
                  />
                  <span className="radio-custom"></span>
                  Phone
                </label>
              </div>
              {errors.meetingType && (
                <span className="error-message">{errors.meetingType}</span>
              )}
            </div>

            <div className="form-section additional-options">
              <h2>When?</h2>

              <div className="datetime-group">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Date</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className={errors.appointmentDate ? "error" : ""}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.appointmentDate && (
                    <span className="error-message">
                      {errors.appointmentDate}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentTime">Time</label>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className={errors.appointmentTime ? "error" : ""}
                  >
                    <option value="">Select time ▼</option>
                    {timeSlots.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.appointmentTime && (
                    <span className="error-message">
                      {errors.appointmentTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="submit-btn">
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default App;
