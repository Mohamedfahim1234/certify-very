import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/axiosInterceptor"; // global JWT-expiry auto-logout

createRoot(document.getElementById("root")!).render(<App />);
