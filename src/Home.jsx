export default function Home() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #ffffff 0%, #fdf6f0 100%)",
        color: "#000000ff",
        textAlign: "center",
        padding: "160px",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <h1 style={{ marginBottom: '0.25rem' }}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0 }}>Health Tracking</h1>
      <h3>Your journey to a healthier you starts here</h3>
      
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
