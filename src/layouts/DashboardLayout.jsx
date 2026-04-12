import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';

function DashboardLayout({ roleKey, logout }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating Top Navbar */}
      <TopNavbar roleKey={roleKey} logout={logout} />

      {/* Main content */}
      <main className="flex-1 main-with-topnav px-5 pb-6 md:px-7">
        <div className="mx-auto max-w-[1200px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
