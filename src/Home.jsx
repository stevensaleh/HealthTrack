export default function Home() {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        textAlign: "center",
        backgroundColor: "#a2a9a5ff",
      }}
    >
      <h1 style={{ 
        position: "absolute",
        top: "50px",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'BBH Sans Hegarty', sans-serif",
        fontSize: "2.5rem",
        color: "#1E1E1E" ,
        whiteSpace: "nowrap", 
      }}
    >
        Welcome to HealthTrack 👟🏋️‍♂️🥗
      </h1>
    </div>
  );
}
