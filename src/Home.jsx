import logo from './assets/HealthTrackLogo.png';
import pic from './assets/Pic.jpg';
import pic2 from './assets/Pic2.jpg';
import HeartRate from './assets/HeartRate.png';
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
          fontFamily: "'Tinos'",
          fontSize: "17px",
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
          fontFamily: "'Tinos'",
          fontSize: "17px",        
        }}
      >
        <b>How It Works</b>
      </button>      

      <h1 style={{ marginBottom: '15px'}}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0, marginBottom: '25px'}}>Health Tracking</h1>
      <p style={{ marginTop: 0, fontSize: '25px' }}>Your journey to a healthier you starts here</p>
      <img
        src={pic}
        style={{
          marginTop: '25px',
          width: '97%',
          height: '600px',
          objectFit: 'cover',
          objectPosition: 'center',
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
      <div style={{ textAlign: 'left' }}>
        <div
          style={{
            position: 'relative',
            width: '500px',
            height: '500px',
            marginTop: '150px',
          }}
        >
          <img
            src={pic2}
            alt="Additional"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          />
          <img
            src={HeartRate}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              height: '350px',
              borderRadius: '20px',
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </div>
  );
}
