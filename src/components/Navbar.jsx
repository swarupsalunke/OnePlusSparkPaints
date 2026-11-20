import { useState } from "react";
import {
  Menu,
  Search,
  Plus,
  Bell,
  ClipboardCheck,
  CalendarDays,
  Moon,
  Grid3X3,
  ChevronDown,
} from "lucide-react";




const Navbar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
const [selectedDate, setSelectedDate] = useState("");
  return (
    <header className="top-navbar">

      {/* ================= LEFT ================= */}
      <div className="navbar-left">
        {/* Search */}
        {/* <div className="navbar-search">
          <input
            type="text"
            placeholder="Search anything..."
          />

          <span className="search-shortcut">
            Ctrl + K
          </span>
        </div> */}

      </div>


      {/* ================= RIGHT ================= */}
      <div className="navbar-right">

        {/* Add */}
        {/* <button className="navbar-icon-btn add-btn">
          <Plus size={20} />
        </button> */}

        


        {/* Notification */}
        <button className="navbar-icon-btn notification-btn">

          <Bell size={19} />

          {/* <span className="notification-count">
            12
          </span> */}

        </button>


        {/* Task / Checklist */}
        {/* <button className="navbar-icon-btn">
          <ClipboardCheck size={19} />
        </button> */}


        {/* Calendar */}
        
<div className="calendar-wrapper">
  <button
    className="navbar-icon-btn"
    onClick={() => setShowCalendar(!showCalendar)}
    type="button"
  >
    <CalendarDays size={19} />
  </button>

  {showCalendar && (
    <input
      type="date"
      className="calendar-input"
      value={selectedDate}
      onChange={(e) => {
        setSelectedDate(e.target.value);
        setShowCalendar(false);
      }}
      autoFocus
    />
  )}
</div>



        {/* Dark Mode */}
        {/* <button className="navbar-icon-btn">
          <Moon size={19} />
        </button> */}


        {/* Apps */}
        {/* <button className="navbar-icon-btn">
          <Grid3X3 size={19} />
        </button> */}


        {/* Profile */}
        <div className="navbar-profile">

          <div className="navbar-profile-image">
            SA
          </div>

          <div className="navbar-profile-info">

            <strong>
              Super Admin
            </strong>

            <span>
              Super Admin
            </span>

          </div>

          {/* <ChevronDown
            size={15}
            className="profile-arrow"
          /> */}

        </div>

      </div>

    </header>
  );
};

export default Navbar;