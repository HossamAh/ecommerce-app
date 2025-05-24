import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import StoreProvider from '../StoreProvider';
import Header from '../components/core/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard - E-Commerce",
  description: "Manage your e-commerce dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <div className="flex">
            <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
              <h2 className="text-xl font-bold mb-6">Dashboard</h2>
              <nav>
                <ul className="space-y-2">
                  <li><a href="/dashboard" className="block p-2 hover:bg-gray-700 rounded">Overview</a></li>
                  <li><a href="/dashboard/products" className="block p-2 hover:bg-gray-700 rounded">Products</a></li>
                  <li><a href="/dashboard/orders" className="block p-2 hover:bg-gray-700 rounded">Orders</a></li>
                  <li><a href="/dashboard/customers" className="block p-2 hover:bg-gray-700 rounded">Customers</a></li>
                  <li><a href="/dashboard/settings" className="block p-2 hover:bg-gray-700 rounded">Settings</a></li>
                </ul>
              </nav>
            </aside>
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}


