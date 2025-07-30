import {
  FaTachometerAlt,
  FaBox,
  FaUserFriends,
  FaClipboardList,
  FaTags,
  FaUserCircle,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';
import { MdOutlineMessage } from "react-icons/md";
import { GrProjects } from "react-icons/gr";
import { Link } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import Logo from '../assets/Logo.png';
import { CartContext } from '../Contexts/Context';
import { FaTv } from "react-icons/fa";
export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, data } = useContext(CartContext)

  // Collapse on mobile link click
  const handleLinkClick = () => {
    if (window.innerWidth <= 768 && isOpen) {
      toggleSidebar();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && !isOpen) {
        toggleSidebar(); // Ensure it's open on larger screens
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggleSidebar]);


  return (
    <div className={`min-h-full ${isOpen ? 'w-64' : 'w-23'} bg-[#2c3e50] text-white flex flex-col fixed z-40 top-0 left-0 justify-between transition-all duration-300`}>
      <div>
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between px-3 py-2 text-xl font-bold">
          <div className="flex items-center gap-2">
            <Link to='/'>
              <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full" />
            </Link>
          </div>
          <button onClick={toggleSidebar}>
            {isOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
          </button>
        </div>

        {/* Menu Sections */}
        <div className="px-2 mt-3 text-sm space-y-4">
          <div>
            {isOpen && <p className="text-gray-400 uppercase mb-2 text-xs">Menu</p>}
            <ul className="space-y-2 cursor-pointer">
              <Link to="/" onClick={handleLinkClick}>
                <li className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded">
                  <FaTachometerAlt />
                  {isOpen && <span>Dashboard</span>}
                </li>
              </Link>
            </ul>
          </div>

          <div>
            {isOpen && <p className="text-gray-400 uppercase mb-2 text-xs">Management</p>}
            <ul className="space-y-2 cursor-pointer">
              {[
                { to: "/categories", icon: <FaTags />, label: "Categories" },
                { to: "/products", icon: <FaBox />, label: "Products" },
                { to: "/orders", icon: <FaClipboardList />, label: "Orders" },
                { to: "/messages", icon: <MdOutlineMessage />, label: "Messages" },
                { to: "/users", icon: <FaUserFriends />, label: "Users" },
                { to: "/electronics", icon: <FaTv />, label: "Electonics" },
                { to: "/project", icon: <GrProjects />, label: "Projects" },

              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} onClick={handleLinkClick}>
                  <li className="flex items-center gap-6 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded">
                    {icon}
                    {isOpen && <span>{label}</span>}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer / User Info */}
      <div className="p-3 flex items-center gap-3 text-sm">
        <Link to="/profile" onClick={handleLinkClick}>
          <FaUserCircle className="text-3xl" />
        </Link>
        {isOpen && (
          <div>
            <p className="font-semibold">{data?.name}</p>
            <p className="text-xs text-white/80">Admin</p>
          </div>
        )}
      </div>
    </div>
  );
}
