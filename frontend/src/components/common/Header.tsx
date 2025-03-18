import React from "react";
import { Link, NavLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-dice-6 me-2"></i>
            보드게임 모임 관리
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
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/players">
                  <i className="bi bi-people me-1"></i> 플레이어
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/meetings">
                  <i className="bi bi-calendar-event me-1"></i> 모임
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/games">
                  <i className="bi bi-controller me-1"></i> 게임
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-plus-circle me-1"></i> 추가
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item" to="/players/add">
                      <i className="bi bi-person-plus me-2"></i> 플레이어 추가
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/meetings/add">
                      <i className="bi bi-calendar-plus me-2"></i> 모임 추가
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/games/add">
                      <i className="bi bi-joystick me-2"></i> 게임 추가
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/game-records/add">
                      <i className="bi bi-trophy me-2"></i> 게임 기록 추가
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
