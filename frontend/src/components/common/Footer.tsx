import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-light text-center p-3 mt-4">
      <div className="container">
        <p className="mb-0">
          © {new Date().getFullYear()} 클로에 보드게임 트래커
        </p>
      </div>
    </footer>
  );
};

export default Footer;
