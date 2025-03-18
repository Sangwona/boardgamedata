import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            보드게임 데이터
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/meetings")}`}
                  to="/meetings"
                >
                  <i className="bi bi-calendar-event me-1"></i> 모임
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/players")}`}
                  to="/players"
                >
                  <i className="bi bi-people me-1"></i> 플레이어
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className={`nav-link dropdown-toggle ${
                    location.pathname.includes("/game") ? "active" : ""
                  }`}
                  href="#"
                  id="gamesDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-controller me-1"></i> 게임
                </a>
                <ul className="dropdown-menu" aria-labelledby="gamesDropdown">
                  <li>
                    <Link className="dropdown-item" to="/games">
                      <i className="bi bi-list me-1"></i> 게임 목록
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/games/add">
                      <i className="bi bi-plus-circle me-1"></i> 게임 추가
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            <div className="d-flex">
              <Link to="/meetings/add" className="btn btn-outline-light me-2">
                <i className="bi bi-plus-circle me-1"></i> 모임 추가
              </Link>
              <Link to="/players/add" className="btn btn-outline-light">
                <i className="bi bi-person-plus me-1"></i> 플레이어 추가
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
