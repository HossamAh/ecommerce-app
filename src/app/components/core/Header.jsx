'use client';
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { getUser , UserLogout } from "../../features/thunks/UserThunk";
import { getCart } from "../../features/thunks/CartThunk";
import { SelectUser, SelectCart } from "../../selectors";
import axios from 'axios';
import nextConfig from '../../../../next.config.mjs';
import useLocalStorage from '../../utils/LocalStorage';
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector(SelectUser);
  const cart = useSelector(SelectCart);
  const [accessToken, setAccessToken] = useLocalStorage('accessToken', '');
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  // Skip auth check on auth pages to prevent redirect loops
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  const logout = async (accessToken) => {
    try {
      dispatch(UserLogout(accessToken));
      // Clear access token from local storage
      localStorage.removeItem('accessToken');
      setAccessToken('');
      
      // Clear refresh token from cookies
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  
  useEffect(() => {
    // Skip auth check if we're on an auth page
    if (isAuthPage) {
      setIsLoading(false);
      return;
    }
    if(user?.accessToken){
      setAccessToken(user.accessToken)
    }
    // Only fetch user data if we have an access token
    if (accessToken) {
      dispatch(getUser(accessToken))
      .then(() => {
          dispatch(getCart(accessToken))
        }).finally(()=>{
          setIsLoading(false);

        });
    } else {
      setIsLoading(false);
    }
  }, [dispatch,user?.accessToken ,accessToken, isAuthPage]);
  
  // Show minimal loading state
  if (isLoading) {
    return <div className="h-16 bg-gray-800"></div>;
  }
  
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold mr-4">
          E-Commerce
        </Link>
        <nav className="grow-1 flex justify-between items-center">
          <ul className="flex space-x-4">
            <li>
              <Link href='/products' >
                products
              </Link>
            </li>
            {
              user?.user?.role==='admin' &&
            <li>
              <Link href='/dashboard' >
                Dashboard
              </Link>
            </li>
            }
          </ul>
          <ul className="flex space-x-4">
            {user?.user !== null && user?.loadingStatus === "completed" ? (
              <>
                <li>
                  <Link href="/profile">{user.user.name}</Link>
                </li>
                <li>
                  <button className="cursor-pointer" onClick={() => logout(accessToken)}>
                    logout
                  </button>
                </li>
              </>
            ) : (
              !isAuthPage && (
                <li>
                  <Link href="/login">Login</Link>
                </li>
              )
            )}
            
            <li>
              <Link href="/cart" className="relative">
                Cart
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart?.cartItems?.length||0}
                  </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
