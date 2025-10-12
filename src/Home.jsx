export default function Home() {
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
