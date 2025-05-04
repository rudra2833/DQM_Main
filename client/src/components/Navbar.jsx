import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeOffcanvas = (container) => {
    const content = document.querySelector(`.${container}`);
    if (content) {
      content.style.maxHeight = null;
    }
    setSidebarOpen(false);
  };

  const toggleCollapsible = (container) => {
    if (!sidebarOpen) return;

    let content;
    const button = document.querySelector(".collapsible");

    switch (container) {
      case 'content1':
        content = document.querySelector(".content1");
        break;
      case 'content2':
        content = document.querySelector(".content2");
        break;
      default:
        break;
    }

    if (button && content) {
      button.classList.toggle("active");
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg " style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', backgroundColor: '#b8b8ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     

 
            <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <h4>
                <Link to="/" className="navbar-brand fs-2 fw-bold">
                  <img className="logo-img" src="bisag_logo.png" alt="logo" />
                </Link>
                <Link className="logo" to="/generaldetails" style={{ marginLeft: '10px' }}>Home</Link>
              </h4>
            </div>
            {location.pathname !== '/' && (
              <div style={{ display: 'flex', flexDirection:'column', flexGrow: 1, marginLeft: '20px', marginRight: '20px' }}>
                <h2 style={{
                  textAlign: "center", background: 'linear-gradient(to right , #2e75b6, #2e75b6, #2e75b6, #973b5b, #ff0000, #973b5b, #2e75b6, #2e75b6, #2e75b6)', WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text', paddingBottom: "5px", marginTop: "0.5rem" 
                }}><b>Data Quality Assessment</b>
                </h2>
                <small style={{textAlign:'center', marginTop:'-5px', marginBottom: '10px', fontStyle: 'oblique'}}>
                Reference: ISO 19157-1:2023(E) Geographic information - Data Quality – Part-1: General requirements
                </small>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginLeft: 'auto', marginTop: "1rem" }}>
              <h4>
                <Link className="logo" to="/usecases">Usecases</Link>

                <button className="btn" type="button" onClick={toggleSidebar} aria-controls="offcanvasExample">
                  <span className="navbar-toggler-icon"></span>
                </button>
              </h4>
            </div>
      </nav>

      <div
        className={`offcanvas offcanvas-start ${sidebarOpen ? 'show' : ''}`}
        style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', backgroundColor: '#fff' }}
        tabIndex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-body">
          <div className="head">
            <h1>Data Quality</h1>
            <span>
              <button type="button" className="btn-close btn-close-white" onClick={() => closeOffcanvas()} aria-label="Close"></button>
            </span>
          </div>
          <hr />
          <Link className="links" to="/generaldetails" onClick={() => closeOffcanvas()}>
            <div className="hoverEffect">
              <span className="icons material-symbols-outlined">dashboard</span> DashBoard
            </div>
          </Link>

          <button className="collapsible hoverEffect" onClick={() => toggleCollapsible('content1')}>
            Completeness Checks<span className="material-symbols-outlined">chevron_right</span>
          </button>
          <div className="content content1">
            <div className="sub-categories">
              <Link className="links" to="/omission" onClick={() => closeOffcanvas('content1')}>
                <div className="hoverEffect">
                  Omission
                </div>
              </Link>
              <Link className="links" to="/comission" onClick={() => closeOffcanvas('content1')}>
                <div className="hoverEffect">
                  Comission
                </div>
              </Link>
            </div>
          </div>

          <button className="collapsible hoverEffect" onClick={() => toggleCollapsible('content2')}>
            Logical Consistency <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <div className="content content2">
            <div className="sub-categories">
              <Link className="links" to="/formatconsistency" onClick={() => closeOffcanvas('content2')}>
                <div className="hoverEffect">
                  Format Consistency
                </div>
              </Link>
              <Link className="links" to="/domainconsistency" onClick={() => closeOffcanvas('content2')}>
                <div className="hoverEffect">
                  Domain Consistency
                </div>
              </Link>
            </div>
          </div>
          <Link className="links" to="/userdefined" onClick={() => closeOffcanvas('content2')} >
            <div className="hoverEffect">
              UserDefined
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Navbar;