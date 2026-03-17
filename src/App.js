# import React, { useState } from "react";
import Dashboard from "../components/Dashboard";
import Subscriptions from "../components/Subscriptions";
import Watchlist from "../components/Watchlist";
import Suggestions from "../components/Suggestions";

function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "subscriptions":
        return <Subscriptions />;
      case "watchlist":
        return <Watchlist />;
      case "suggestions":
        return <Suggestions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", padding: "10px" }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("subscriptions")}>Subscriptions</button>
        <button onClick={() => setPage("watchlist")}>Watchlist</button>
        <button onClick={() => setPage("suggestions")}>Suggestions</button>
      </nav>

      <div style={{ padding: "20px" }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
