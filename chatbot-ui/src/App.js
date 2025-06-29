import React from "react";
import ChatBot from "./components/ChatBot/ChatBot";
import "./styles/App.css";
import Spline from '@splinetool/react-spline';

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-container">
              <h1 className="logo">Flexwork</h1>
              <p className="tagline">YOUR TIME. YOUR TERM. YOUR EARNINGS</p>
            </div>
            <nav>
              <ul>
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#why-us">Why Us</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </nav>
            <div className="cta-buttons">
              <a href="#demo" className="btn btn-outline-light">
                Get Demo
              </a>
              <a href="#started" className="btn btn-warning">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-wrapper">
            <div className="hero-content">
              <div className="hero-tag">300,000+ Experts Ready</div>
              <h2>
                Find Top Remote Jobs or Hire Plug-and-Play Talent by the Hour or
                Day!
              </h2>
              <p>
                Over 10 Million Job seekers have used Flexwork Jobs to find a
                better way to work
              </p>
              <a href="#register" className="btn btn-lg btn-warning">
                Register Now
              </a>
            </div>
            <div className="spline-container">
              <Spline scene="https://prod.spline.design/yCotex5pArCv3btC/scene.splinecode" />
            </div>
          </div>
        </section>
      </main>
      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
}

export default App;
