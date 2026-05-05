import { useEffect } from "react";
import { initMessaging, getToken, onMessage } from "../firebase.js";
import api from "../services/api.js";
import toast from "react-hot-toast";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const useNotification = () => {
  useEffect(() => {
    const setupPush = async () => {
      try {
        // Check browser support first
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
          console.log("Push not supported on this browser");
          return;
        }

        // Initialize messaging — returns null if unsupported
        const messagingInstance = await initMessaging();
        if (!messagingInstance) {
          console.log("Firebase Messaging not supported on this browser");
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Get FCM token
        const token = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!token) return;

        // Save token to backend
        await api.post("/notify/save-token", { fcm_token: token });
        console.log("FCM token saved ✅");

        // Handle foreground notifications
        onMessage(messagingInstance, (payload) => {
          toast(payload.notification?.body || "New notification", {
            icon: "🎬",
            duration: 5000,
          });
        });
      } catch (err) {
        // Fail silently — push is a bonus feature, not critical
        console.log("Push setup skipped:", err.message);
      }
    };

    setupPush();
  }, []);
};

export default useNotification;
