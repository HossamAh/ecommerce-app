
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from './StoreProvider';
import Header from './components/core/Header';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "E-Commerce Platform",
  description: "Shop the latest products on our e-commerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}

