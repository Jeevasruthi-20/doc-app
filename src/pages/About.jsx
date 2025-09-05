import React from "react";
import "./About.css"; // ✅ optional styling file

const About = () => {
  return (
    <div className="about-page section">
      <div className="container">
        {/* Header */}
        <h1 className="section-title">About MedConnect</h1>
        <p className="about-intro">
          MedConnect is a modern healthcare platform designed to bridge the gap between patients 
          and trusted medical professionals. We focus on accessibility, convenience, and delivering 
          the best possible healthcare experience for everyone.
        </p>

        {/* Mission */}
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make quality healthcare accessible to everyone, everywhere. 
            We empower patients to find the right doctors, book appointments effortlessly, 
            and manage their health with confidence.
          </p>
        </div>

        {/* Vision */}
        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            We envision a world where technology simplifies healthcare, ensuring no patient is left behind. 
            MedConnect strives to become the most trusted partner in connecting patients with doctors globally.
          </p>
        </div>

        {/* Core Values */}
        <div className="about-section">
          <h2>Our Core Values</h2>
          <ul>
            <li><strong>Trust:</strong> Building strong, transparent relationships between patients and doctors.</li>
            <li><strong>Accessibility:</strong> Making healthcare available to people regardless of location or language.</li>
            <li><strong>Innovation:</strong> Using the latest technology to improve healthcare services.</li>
            <li><strong>Compassion:</strong> Putting people at the heart of everything we do.</li>
          </ul>
        </div>

        {/* Why Choose Us */}
        <div className="about-section">
          <h2>Why Choose MedConnect?</h2>
          <p>
            With MedConnect, patients enjoy seamless access to healthcare:
          </p>
          <ul>
            <li>Find and connect with top-rated doctors across specialties.</li>
            <li>Book and manage appointments online with ease.</li>
            <li>Access reliable health resources and support.</li>
            <li>Enjoy safe and secure digital healthcare services.</li>
          </ul>
        </div>

        {/* Team Section */}
        <div className="about-section">
          <h2>Meet Our Team</h2>
          <p>
            Behind MedConnect is a passionate team of healthcare professionals, 
            technologists, and innovators dedicated to making healthcare simple, 
            reliable, and accessible. Together, we are building a healthier tomorrow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
