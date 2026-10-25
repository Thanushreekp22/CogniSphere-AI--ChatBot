import { useContext, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import "./Navbar.css";

function Navbar({ isVisible = true }) {
    const { user, handleLogout, isSidebarOpen, setIsSidebarOpen } = useContext(MyContext);
    const [isOpen, setIsOpen] = useState(false);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
                <button className="hamburger-menu" onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="brand-name">
                    CogniSphere
                </div>

                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {isOpen && 
                <div className="dropDown">
                    <div className="dropDownItem user-info">
                        <i className="fa-solid fa-user"></i>
                        <span>{user?.name || 'User'}</span>
                    </div>
                    <div className="dropDownItem" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </div>
                </div>
            }
        </>
    );
}

export default Navbar;
