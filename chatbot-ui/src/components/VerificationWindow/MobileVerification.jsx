import { useState } from 'react';
import './MobileVerification.css';
import { TbDeviceMobileMessage } from "react-icons/tb";
import { LuMail } from "react-icons/lu";

export default function MobileVerification({ onProceedToBot = () => {} }) {
  const [verificationMethod, setVerificationMethod] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);


    // Country codes data
  const countryCodes = [
        { code: '+91', country: 'IN' },
        { code: '+1', country: 'US' },
        { code: '+44', country: 'UK' },
        { code: '+86', country: 'CN' },
        { code: '+81', country: 'JP' },
        { code: '+33', country: 'FR' },
        { code: '+49', country: 'DE' },
        { code: '+7', country: 'RU' },
        { code: '+55', country: 'BR' },
        { code: '+61', country: 'AU' }
      ];
  
  const handlePhoneChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  const switchToEmail = () => {
    setVerificationMethod('email');
  };
  
  const switchToPhone = () => {
    setVerificationMethod('phone');
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
    
    if (verificationMethod === 'phone' && !validatePhone(phoneNumber)) {
      return;
    }
    
    if (verificationMethod === 'email' && !validateEmail(email)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pass data to parent component
      onProceedToBot({
        name: name,
        contactMethod: verificationMethod,
        contactValue: verificationMethod === 'phone' 
          ? `${selectedCountryCode}${phoneNumber}` 
          : email,
        // Include specific contact fields for database
        phone: verificationMethod === 'phone' ? `${selectedCountryCode}${phoneNumber}` : null,
        email: verificationMethod === 'email' ? email : null
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-verification-container">
      {/* Yellow curved background */}
      <div className="yellow-background">
        {/* Icon: Phone or Email based on method */}
        <div className="icon-container">
          {verificationMethod === 'phone' ? (
            <TbDeviceMobileMessage size={70} color='#FFFFFF'/>
          ) : (
            <LuMail size={60} color='#FFFFFF' />
          )}
        </div>
        
        {/* Title and text based on verification method */}
        <h1 className="title">
          {verificationMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
        </h1>
      </div>
      
      {/* Form content */}
      <div className="form-content">
        {/* Toggle between phone and email */}
        <div className="toggle-container">
          {verificationMethod === 'phone' ? (
            <button type="button" className="toggle-button" onClick={switchToEmail}>
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Use Email Instead</span>
            </button>
          ) : (
            <button type="button" className="toggle-button" onClick={switchToPhone}>
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
              <span>Use Phone Instead</span>
            </button>
          )}
        </div>
      
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

          {verificationMethod === 'phone' ? (
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
                placeholder="Email Address"
                className="email-input"
                disabled={isLoading}
              />
            </>
          )}
          
          {/* Next button */}
          <button 
            type="submit" 
            className="next-button"
            disabled={isLoading || (verificationMethod === 'phone' ? phoneNumber.length !== 10 : !validateEmail(email))}
          >
            {isLoading ? 'Processing...' : 'Next'}
          </button>
        </form>
      </div>
    </div>
  );
}