const Logo = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Hand-drawn style Justice Scale */}
      <path d="M12 3c0.5 6 -0.5 12 0 18" /> {/* Organic Pole */}
      <path d="M4 8c5 -1 11 1 16 0" />      {/* Curved Crossbar */}
      <path d="M4 8c0 5 2 6 4 6s4 -1 4 -6" /> {/* Left Pan */}
      <path d="M16 8c0 5 2 6 4 6s4 -1 4 -6" /> {/* Right Pan */}
      <circle cx="12" cy="3" r="1" />       {/* Top Ring */}
    </svg>
  );
};

export default Logo;