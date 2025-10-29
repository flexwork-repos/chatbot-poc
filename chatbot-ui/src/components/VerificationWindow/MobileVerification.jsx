import { useState } from "react";
import "./MobileVerification.css";
import { TbDeviceMobileMessage } from "react-icons/tb";
import { LuMail } from "react-icons/lu";
import { FwLogo } from "../ChatBotWindow/ChatBotWindow";

export default function MobileVerification({ onProceedToBot = () => {} }) {
  const [verificationMethod, setVerificationMethod] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isGetStarted, setIsGetStarted] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);

  // Country codes data
  const countryCodes = [
    { code: "+91", country: "IN" },
    { code: "+1", country: "US" },
    { code: "+44", country: "UK" },
    { code: "+86", country: "CN" },
    { code: "+81", country: "JP" },
    { code: "+33", country: "FR" },
    { code: "+49", country: "DE" },
    { code: "+7", country: "RU" },
    { code: "+55", country: "BR" },
    { code: "+61", country: "AU" },
  ];

  const handlePhoneChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const switchToEmail = () => {
    setVerificationMethod("email");
  };

  const switchToPhone = () => {
    setVerificationMethod("phone");
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return phone.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!name.trim()) {
      return; // Name is required
    }

    if (verificationMethod === "phone" && !validatePhone(phoneNumber)) {
      return;
    }

    if (verificationMethod === "email" && !validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Pass data to parent component
      onProceedToBot({
        name: name,
        contactMethod: verificationMethod,
        contactValue:
          verificationMethod === "phone"
            ? `${selectedCountryCode}${phoneNumber}`
            : email,
        // Include specific contact fields for database
        phone:
          verificationMethod === "phone"
            ? `${selectedCountryCode}${phoneNumber}`
            : null,
        email: verificationMethod === "email" ? email : null,
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-verification-container">
      {isGetStarted && (
        <div
          className="d-flex flex-column h-100 justify-content-between getstarted"
          style={{ padding: "28px" }}
        >
          <div>
            <FwLogo />
          </div>
          <div>
            <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
              <h1
                className="mb-4"
                style={{
                  color: "white",
                  textAlign: "left",
                  fontFamily: "Lato",
                  fontWeight: "500",
                  fontStyle: "SemiBold",
                  fontSize: "32px",
                  lineHeight: "110%",
                }}
              >
                Hey Boss 👋 I'm Flexa AI, your personal chat assistant.
              </h1>
              <p
                style={{
                  color: "white",
                  textAlign: "left",
                  fontFamily: "Lato",
                  fontWeight: "400",
                  fontStyle: "Regular",
                  fontSize: "14px",
                  lineHeight: "110%",
                }}
              >
                Ask me anything I'm always here to help you get things done!
              </p>
            </div>
          </div>
          <div className="d-flex align-item-center justify-content-center">
            <img src={require("../assets/chatbot_new.webp")} alt="Flexa AI" />
          </div>
          <div className="w-100 d-flex justify-content-center">
            <button
              onClick={() => setIsGetStarted(false)}
              className="btn btn-getstarted btn-lg w-100"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                fontSize: "20px",
                fontWeight: "500",
                padding: "10px 10px 10px 20px",
                maxWidth: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              Get Started
              <span
                style={{
                  background: "white",
                  color: "#7c3aed",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                <i className="bi bi-caret-right-fill"></i>
              </span>
            </button>
          </div>
        </div>
      )}
      {!isGetStarted && (
        <div
          className="d-flex flex-column h-100 justify-content-between getstarted"
          style={{ padding: "28px" }}
        >
          <div>
            <FwLogo />
          </div>
          <div>
            <div className="text-center flex-grow-1 d-flex flex-column justify-content-center">
              <h1
                className="mb-4"
                style={{
                  color: "white",
                  fontFamily: "Lato",
                  fontWeight: "500",
                  fontStyle: "SemiBold",
                  fontSize: "32px",
                  lineHeight: "110%",
                }}
              >
                Welcome to Flexwork Support
              </h1>
              <p
                style={{
                  color: "white",
                  fontFamily: "Lato",
                  fontWeight: "400",
                  fontStyle: "Regular",
                  fontSize: "14px",
                  lineHeight: "110%",
                }}
              >
                Hi 👋 Please fill out the form below to start chatting with the
                ARTH-AI.
              </p>
            </div>
          </div>
          {/* Form content */}
          <div className="form-container">
            <ul className="nav nav-pills nav-justified">
              <li className="nav-item">
                <a
                  className={
                    verificationMethod !== "phone"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  onClick={switchToEmail}
                >
                  Email ID
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={
                    verificationMethod === "phone"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  onClick={switchToPhone}
                >
                  Mobile Number
                </a>
              </li>
            </ul>
            <form onSubmit={handleSubmit}>
              {/* Name input field - always visible */}
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Your Name"
                className="name-input"
                disabled={isLoading}
                required
              />

              {verificationMethod === "phone" ? (
                <>
                  {/* Phone input with country code in same row */}
                  <div className="phone-input-container">
                    <select
                      className="country-code-select"
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Mobile Number"
                      className="phone-input"
                      disabled={isLoading}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Email input */}
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Your Email"
                    className="email-input"
                    disabled={isLoading}
                  />
                </>
              )}

              {/* Next button */}
              <button
                type="submit"
                className="next-button"
                disabled={
                  isLoading ||
                  (verificationMethod === "phone"
                    ? phoneNumber.length !== 10
                    : !validateEmail(email))
                }
              >
                {isLoading ? "Processing..." : "Next"}
              </button>
            </form>
          </div>

          {/* Yellow curved background */}
          {/* <div className="yellow-background">
            <div className="bot-desc">
              <p>
                Hi 👋 Please fill out the form below to start chatting with the
                ARTH-AI.
              </p>
            </div>
            <div className="icon-container">
              {verificationMethod === "phone" ? (
                <TbDeviceMobileMessage size={70} color="#FFFFFF" />
              ) : (
                <LuMail size={60} color="#FFFFFF" />
              )}
            </div>

            <h1 className="title">
              {verificationMethod === "phone"
                ? "Mobile Number"
                : "Email Address"}
            </h1>
          </div> */}
        </div>
      )}
    </div>
  );
}
