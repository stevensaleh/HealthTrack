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
        background: "linear-gradient(to bottom, #1E1E1E, #3E8E7E, #F2F2F2)"
      }}
    >
      <h1 style={{ 
        position: "absolute",
        top: "50px",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'BBH Sans Hegarty', sans-serif",
        fontSize: "2.5rem",
        color: "#FFF" ,
        whiteSpace: "nowrap", 
      }}
    >
        Welcome to HealthTrack 👟🏋️‍♂️🥗
      </h1>
    </div>
  );
}
