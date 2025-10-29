import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(to bottom, #1E1E1E, #3E8E7E, #F2F2F2)",
        color: "#fff",
        textAlign: "center",
        padding: "40px",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              marginRight: "10px",
              verticalAlign: "middle",
            }}
          />
        )}
        <span style={{ marginRight: "20px", fontSize: "1rem" }}>
          Welcome, {user?.name || user?.email}!
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "2px solid #fff",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#fff";
            e.target.style.color = "#3E8E7E";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#fff";
          }}
        >
          Logout
        </button>
      </div>

      <h1>Welcome to HealthTrack 👟🥗🏋🏼‍♂️</h1>
      <h3>Your journey to a healthier you starts here 📌</h3>
      
      <div
        style={{
          marginTop: "200px",
          display: "flex",
          justifyContent: "center",
          gap: "50px",
          fontSize: "1.2rem",
        }}
      >
        <button>Button 1</button>
        <button>Button 2</button>
        <button>Button 3</button>
      </div>

    </div>
  );
}
