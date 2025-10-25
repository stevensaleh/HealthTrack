import logo from './assets/HealthTrackLogo.png';
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
        fontFamily: "'Playfair Display'",
      }}
    >
      <img
        src={logo}
        alt="HealthTrack logo"
        style={{
          position: 'absolute',
          top: "100px",
          transform: 'translate(-50%, -50%)',
          height: '250px',
          width: 'auto',
        }}
      />

      <button
        style={{
          position: "fixed",
          top: "40px",
          right: "100px",
          fontFamily: "'Tinos'",
        }}
      >
        <b>Sign In</b>
      </button>
      <button
        style={{
          position: "absolute",
          top: "40px",
          left: "300px",
          backgroundColor: "transparent",
          fontFamily: "'Tinos'"
        }}
      >
        <b>Home</b>
      </button>
      <button
        style={{
          position: "absolute",
          top: "40px",
          left: "400px",
          backgroundColor: "transparent",
          fontFamily: "'Tinos'"          
        }}
      >
        <b>How It Works</b>
      </button>      

      <h1 style={{ marginBottom: '15px'}}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0, marginBottom: '25px'}}>Health Tracking</h1>
      <p style={{ marginTop: 0, fontSize: '25px' }}>Your journey to a healthier you starts here</p>
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
      <p
        style={{
          marginTop: '50px',
          marginBottom: '0px',
          fontSize: '30px',
        }}
      >
        Small steps each day,
      </p>
      <p
        style={{
          marginTop: '1px',
          fontStyle: 'italic',
          fontSize: '30px',
        }}
      >
        lead to big changes tomorrow.
      </p>
    </div>
  );
}
