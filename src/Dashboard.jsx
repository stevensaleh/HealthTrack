import logo from './assets/HealthTrackLogo.png';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const handleScrollToHowItWorks = () => {
    navigate('/', { state: { scrollTo: 'how-it-works' } });
  };
  const titleBodyGap = '24px';

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
          top: "15%",
          transform: 'translate(-50%, -50%)',
          height: '25%',
          width: 'auto',
        }}
      />
              
      <button
        style={{
          position: "fixed",
          top: "5%",
          right: "5%",
          fontFamily: "'Tinos'",
        }}
      >
        <b>Sign In</b>
      </button>

      <button
        onClick={() => navigate('/')}
        style={{
          position: "absolute",
          top: "5%",
          left: "14%",
          backgroundColor: "transparent",
          fontFamily: "'Tinos'",
          fontSize: "17px",
          cursor: 'pointer',
        }}
      >
        <b>Home</b>
      </button>

      <button
        onClick={handleScrollToHowItWorks}
        style={{
          position: "absolute",
          top: "5%",
          left: "20%",
          backgroundColor: "transparent",
          fontFamily: "'Tinos'",
          fontSize: "17px",
          cursor: 'pointer',
        }}
      >
        <b>How It Works</b>
      </button>

      <button
        style={{
          position: "absolute",
          top: "5%",
          left: "29%",
          backgroundColor: "transparent",
          fontFamily: "'Tinos'",
          fontSize: "17px",
          cursor: 'pointer',
        }}
      >
        <b>Dashboard</b>
      </button>

      <h1 style={{ marginTop: '3%', fontSize: '280%' , marginBottom: '0%' }}>Your Health Dashboard</h1>
      <p style={{ fontSize: '140%', marginTop: '1%' }}>Overview and insights will appear here.</p>
    </div>
  );
}
