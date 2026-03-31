import { Outlet } from 'react-router-dom';
import SideNavbar from '../components/SideNavbar';

function DashboardLayout({ roleKey, logout }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (desktop) + Top bar (mobile) */}
      <SideNavbar roleKey={roleKey} logout={logout} />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar spacing is handled by SideNavbar's header element */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          <div className="mx-auto max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
