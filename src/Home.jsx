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
      <button
        style={{
          position: "fixed",
          top: "20px",
          right: "100px",
        }}
      >
        Sign In
      </button>
      <h1 style={{ marginBottom: '0.25rem' }}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0 }}>Health Tracking</h1>
      <h3>Your journey to a healthier you starts here</h3>
    </div>
  );
}
