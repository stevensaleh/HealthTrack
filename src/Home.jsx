import logo from './assets/HealthTrackLogo.png';
import pic from './assets/Pic.jpg';
import pic2 from './assets/Pic2.jpg';
import HeartRate from './assets/HeartRate.png';
import Steps from './assets/Steps.png';
import Shoe from './assets/Pic3.webp';
export default function Home() {
  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
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
        style={{
          position: "absolute",
          top: "5%",
          left: "14%",
          backgroundColor: "transparent",
          fontFamily: "'Tinos'",
          fontSize: "17px",
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

      <h1 style={{ marginBottom: '1%', fontSize: '300%'}}>Step Into Intelligent</h1>
      <h1 style={{ marginTop: 0, marginBottom: '1%', fontSize: '300%'}}>Health Tracking</h1>
      <p style={{ marginTop: 0, fontSize: '140%' }}>Your journey to a healthier you starts here</p>
      <img
        src={pic}
        style={{
          marginTop: '1%',
          width: '97%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      />
      <p
        style={{
          marginTop: '3%',
          marginBottom: '0%',
          fontSize: '35px',
        }}
      >
        Small steps each day,
      </p>
      <p
        style={{
          marginTop: '0.5%',
          fontStyle: 'italic',
          fontSize: '30px',
        }}
      >
        lead to big changes tomorrow.
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5%',
          marginTop: '10%',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            marginLeft: '2%',
            position: 'relative',
            width: '420px',
            height: '420px',
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
              width: '70%',
              height: '70%',
              borderRadius: '20px',
              opacity: 0.9,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p
            style={{
              margin: '0px 100px 10px 200px',
              fontSize: '50px',
              lineHeight: 1.3,
              fontFamily: "'Playfair Display'",
              maxWidth: '520px',
            }}
          >
            Good habits fade<br />when life speeds up
          </p>
          <p
            style={{
              margin: '6px 100px 0px 200px',
              fontSize: '24px',
              lineHeight: 1.5,
              maxWidth: '520px',
              fontStyle: 'italic',
            }}
          >
            “When you track your health, you don’t just measure numbers—you build momentum, accountability, and a clearer path toward the person you want to become.”
          </p>
          <button
            style={{
              margin: '40px 0px 0 350px',
              backgroundColor: '#000',
              color: '#fff',
              fontFamily: "'Tinos'",
              fontSize: '17px',
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: '6px',
            }}
          >
            <b>Get Started</b>
          </button>
        </div>                
      </div>      

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5%',
          marginTop: '10%',
          textAlign: 'left',
          flexDirection: 'row-reverse',
        }}
      >
        <div
          style={{
            marginRight: '2%',
            position: 'relative',
            width: '420px',
            height: '420px',
          }}
        >
          <img
            src={Shoe}
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
            src={Steps}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '70%',
              borderRadius: '20px',
              opacity: 0.9,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p
            style={{
              margin: '0px 100px 10px 100px',
              fontSize: '50px',
              lineHeight: 1.3,
              fontFamily: "'Playfair Display'",
              maxWidth: '520px',
            }}
          >
            Awareness is the first step to better health.
          </p>
          <p
            style={{
              margin: '6px 250px 0px 100px',
              fontSize: '24px',
              lineHeight: 1.5,
              maxWidth: '520px',
              fontStyle: 'italic',
            }}
          >
            "Tracking your health keeps you honest, consistent, and aware—turning every workout, meal, and choice into progress you can see."
          </p>
          <button
            style={{
              margin: '40px 0px 0 260px',
              backgroundColor: '#000',
              color: '#fff',
              fontFamily: "'Tinos'",
              fontSize: '17px',
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: '6px',
            }}
          >
            <b>Get Started</b>
          </button>
        </div>                
      </div>      
      <section
        id="how-it-works"
        style={{
          marginTop: '8%',
          padding: '40px 5% 80px 5%',
          textAlign: 'left',
        }}
      >
        <h2 style={{ fontSize: '42px', marginBottom: '16px' }}>How It Works</h2>
        <p style={{ fontSize: '20px', lineHeight: 1.7 }}>
          HealthTrack brings all your health and fitness data together in one place. Whether you track your steps with Fitbit, monitor your sleep through Apple Health, or log your meals manually, HealthTrack consolidates every source into a single, dynamic dashboard. Once you sign in, you’ll see a complete health summary — from total steps and calories burned to hours slept and current weight, designed to give you a clear picture of your progress over time.
        </p>
        <p style={{ fontSize: '20px', lineHeight: 1.7, marginTop: '16px' }}>
          You can also manually add your own data points, like a new workout session, a meal’s calorie count, or your latest blood pressure reading. HealthTrack syncs seamlessly with major platforms such as Apple Health, Fitbit, and Google Health, ensuring that your data stays accurate and up to date. Beyond tracking, HealthTrack empowers you to set personal health goals — like reaching 10,000 daily steps or hitting your target weight — and visualize your journey toward achieving them. With an intuitive interface and smart data integration, HealthTrack transforms complex health data into meaningful insights that help you stay on track every day.
        </p>
      </section>
    </div>
  );
}
