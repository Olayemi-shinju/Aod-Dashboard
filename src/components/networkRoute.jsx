import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function NetworkWrapper({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      toast.success("Back online!");
    };

    const goOffline = () => {
      setIsOnline(false);
      toast.error("You are offline.");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <>
      {children}

      {!isOnline && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center text-white text-center px-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium">You are currently offline.</p>
          <p className="text-sm text-gray-200">Please check your internet connection.</p>
        </div>
      )}
    </>
  );
}
