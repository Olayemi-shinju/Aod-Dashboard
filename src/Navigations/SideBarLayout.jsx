import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import { useState } from 'react';

export default function SideBarLayout() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <Outlet context={{ isSidebarOpen: isOpen }} />
      </div>
    </div>
  );
}