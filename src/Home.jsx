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
      <h1 style={{ marginBottom: '15px', fontFamily: "'Playfair Display'"  }}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0, marginBottom: '30px', fontFamily: "'Playfair Display'"  }}>Health Tracking</h1>
      <h3 style={{ marginTop: 0, fontFamily: "'Playfair Display'"  }}>Your journey to a healthier you starts here</h3>
      <img
        src="https://hips.hearstapps.com/hmg-prod/images/gettyimages-1166696259.jpg?crop=1.00xw:0.753xh;0,0.127xh&resize=1200:*"
        style={{
          marginTop: '25px',
          width: '100%',
          maxWidth: '1500px',
          height: '600px',
          objectFit: 'cover',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      />
    </div>
  );
}
