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
      <h1 style={{ marginBottom: '1rem', fontFamily: "'Playfair Display'"  }}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0, marginBottom: '2rem', fontFamily: "'Playfair Display'"  }}>Health Tracking</h1>
      <h3 style={{ marginTop: 0 , fontFamily: "'Playfair Display'"  }}>Your journey to a healthier you starts here</h3>
    </div>
  );
}
