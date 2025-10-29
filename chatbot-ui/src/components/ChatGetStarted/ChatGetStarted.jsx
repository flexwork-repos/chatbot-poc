"use client";

import { useState } from "react";
import { useSpring } from "react-spring";

export default function ChatGetStarted() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    // <animated.div className="chatbot shadow-lg" style={chatAnimation}>
      <div
        className="d-flex flex-column justify-content-between align-items-center min-vh-100 p-4"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          fontFamily: "Geist, sans-serif",
        }}
      >
        {/* Header with Logo and Close Button */}
        <div className="w-100 d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-2">
            <span
              className="fw-bold"
              style={{
                fontSize: "28px",
                color: "white",
                letterSpacing: "-0.5px",
              }}
            >
              flex
              <span style={{ color: "#fbbf24" }}>work</span>
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-link p-0"
            style={{
              fontSize: "32px",
              color: "white",
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="text-center mb-5 flex-grow-1 d-flex flex-column justify-content-center">
          <h1
            className="fw-bold mb-4"
            style={{
              fontSize: "56px",
              color: "white",
              lineHeight: "1.2",
              textAlign: "left",
            }}
          >
            Hey Boss 👋 I'm Flexa Ai, your personal chat assistant.
          </h1>

          <p
            className="mb-5"
            style={{
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.9)",
              lineHeight: "1.6",
              textAlign: "left",
            }}
          >
            Ask me anything I'm always here to help you get things done!
          </p>
        </div>

        {/* Robot Illustration */}
        <div className="mb-5">
          <svg
            width="200"
            height="240"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <rect
              x="50"
              y="40"
              width="100"
              height="90"
              rx="20"
              fill="#e5e7eb"
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* Headphones Left */}
            <circle cx="35" cy="60" r="12" fill="#d1d5db" />
            <rect x="30" y="50" width="10" height="20" rx="5" fill="#d1d5db" />

            {/* Headphones Right */}
            <circle cx="165" cy="60" r="12" fill="#d1d5db" />
            <rect x="160" y="50" width="10" height="20" rx="5" fill="#d1d5db" />

            {/* Screen/Face */}
            <rect
              x="60"
              y="50"
              width="80"
              height="70"
              rx="12"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Left Eye */}
            <ellipse cx="75" cy="70" rx="10" ry="14" fill="#06b6d4" />
            <ellipse cx="75" cy="72" rx="6" ry="8" fill="#0891b2" />

            {/* Right Eye */}
            <ellipse cx="125" cy="70" rx="10" ry="14" fill="#06b6d4" />
            <ellipse cx="125" cy="72" rx="6" ry="8" fill="#0891b2" />

            {/* Smile */}
            <path
              d="M 85 95 Q 100 105 115 95"
              stroke="#06b6d4"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Body */}
            <rect
              x="55"
              y="130"
              width="90"
              height="80"
              rx="15"
              fill="#f3f4f6"
              stroke="#e5e7eb"
              strokeWidth="2"
            />

            {/* Chest Panel */}
            <rect
              x="65"
              y="145"
              width="70"
              height="50"
              rx="8"
              fill="#e5e7eb"
              stroke="#d1d5db"
              strokeWidth="1"
            />

            {/* Left Arm */}
            <ellipse cx="30" cy="160" rx="18" ry="35" fill="#e5e7eb" />

            {/* Right Arm */}
            <ellipse cx="170" cy="160" rx="18" ry="35" fill="#e5e7eb" />

            {/* Bottom Sphere */}
            <circle
              cx="100"
              cy="200"
              r="25"
              fill="#f3f4f6"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Get Started Button */}
        <div className="w-100 d-flex justify-content-center">
          <button
            className="btn btn-lg w-100"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontSize: "20px",
              fontWeight: "600",
              padding: "16px 32px",
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
              ›
            </span>
          </button>
        </div>
      </div>
    // </animated.div>
  );
}
