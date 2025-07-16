import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const handleVerify = (e) => {
    e.preventDefault();

    console.log("Verifying OTP:", otp, "for", email);

    alert("OTP Verified! Redirecting to Home.");
    navigate("/");
  };

  return (
    <div className="auth-container">
      <h2>Enter OTP sent to {email}</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOtp;
