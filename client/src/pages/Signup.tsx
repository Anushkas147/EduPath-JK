import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Signup() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login since we only use Google OAuth
    setLocation('/login');
  }, [setLocation]);

  return null;
}