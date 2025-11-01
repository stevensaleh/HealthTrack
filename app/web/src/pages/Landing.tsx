// src/pages/Landing.tsx
import { useNavigate } from 'react-router-dom';
import logo from '../assets/HealthTrackLogo.png';
import pic from '../assets/Pic.jpg';
import pic2 from '../assets/Pic2.jpg';
import HeartRate from '../assets/HeartRate.png';
import Steps from '../assets/Steps.png';
import Shoe from '../assets/Pic3.webp';

export default function Landing() {
  const navigate = useNavigate();

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="page-gradient" style={{ padding: '160px', textAlign: 'center' }}>
      <img
        src={logo}
        alt="HealthTrack logo"
        style={{
          position: 'absolute',
          top: '15%',
          transform: 'translate(-50%, -50%)',
          height: '25%',
          width: 'auto',
        }}
      />

      <button
        onClick={handleSignIn}
        className="btn-primary btn-md"
        style={{
          position: 'fixed',
          top: '5%',
          right: '5%',
        }}
      >
        Sign In
      </button>

      <button
        className="btn-ghost btn-md"
        style={{
          position: 'absolute',
          top: '5%',
          left: '14%',
        }}
      >
        Home
      </button>

      <button
        onClick={handleScrollToHowItWorks}
        className="btn-ghost btn-md cursor-pointer"
        style={{
          position: 'absolute',
          top: '5%',
          left: '20%',
        }}
      >
        How It Works
      </button>

      <h1 className="heading-1 mb-2" style={{ fontSize: '300%' }}>
        Step Into Intelligent
      </h1>
      <h1 className="heading-1 mt-0 mb-2" style={{ fontSize: '300%' }}>
        Health Tracking
      </h1>
      <p className="body-xl mt-0" style={{ fontSize: '140%' }}>
        Your journey to a healthier you starts here
      </p>

      <img
        src={pic}
        alt="Health tracking illustration"
        style={{
          marginTop: '1%',
          width: '97%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      />

      <p className="heading-5 mt-12 mb-2">Small steps each day,</p>
      <p className="heading-6 text-italic mt-2">lead to big changes tomorrow.</p>

      {/* Heart Rate Section */}
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
            alt="Heart rate monitoring"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          />
          <img
            src={HeartRate}
            alt="Heart rate graph"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '70%',
              borderRadius: 'var(--radius-lg)',
              opacity: 0.9,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p className="heading-2" style={{ margin: '0px 100px 10px 200px', maxWidth: '520px' }}>
            Good habits fade<br />when life speeds up
          </p>
          <p
            className="body-xl text-italic"
            style={{
              margin: '6px 100px 0px 200px',
              maxWidth: '520px',
            }}
          >
            "When you track your health, you don't just measure numbers—you build momentum,
            accountability, and a clearer path toward the person you want to become."
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-primary btn-md cursor-pointer"
            style={{ margin: '40px 0px 0 350px', alignSelf: 'flex-start' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Steps Section */}
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
            alt="Running shoes"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          />
          <img
            src={Steps}
            alt="Steps tracking"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '70%',
              borderRadius: 'var(--radius-lg)',
              opacity: 0.9,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p className="heading-2" style={{ margin: '0px 100px 10px 100px', maxWidth: '520px' }}>
            Awareness is the first step to better health.
          </p>
          <p
            className="body-xl text-italic"
            style={{
              margin: '6px 250px 0px 100px',
              maxWidth: '520px',
            }}
          >
            "Tracking your health keeps you honest, consistent, and aware—turning every workout,
            meal, and choice into progress you can see."
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-primary btn-md cursor-pointer"
            style={{ margin: '40px 0px 0 260px', alignSelf: 'flex-start' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          marginTop: '8%',
          padding: '40px 5% 80px 5%',
          textAlign: 'left',
        }}
      >
        <h2 className="heading-3 mb-4">How It Works</h2>
        <p className="body-lg" style={{ lineHeight: 1.7 }}>
          HealthTrack brings all your health and fitness data together in one place. Whether you
          track your steps with Fitbit, monitor your sleep through Apple Health, or log your meals
          manually, HealthTrack consolidates every source into a single, dynamic dashboard. Once you
          sign in, you'll see a complete health summary — from total steps and calories burned to
          hours slept and current weight, designed to give you a clear picture of your progress
          over time.
        </p>
        <p className="body-lg mt-4" style={{ lineHeight: 1.7 }}>
          You can also manually add your own data points, like a new workout session, a meal's
          calorie count, or your latest blood pressure reading. HealthTrack syncs seamlessly with
          major platforms such as Apple Health, Fitbit, and Google Health, ensuring that your data
          stays accurate and up to date. Beyond tracking, HealthTrack empowers you to set personal
          health goals — like reaching 10,000 daily steps or hitting your target weight — and
          visualize your journey toward achieving them. With an intuitive interface and smart data
          integration, HealthTrack transforms complex health data into meaningful insights that help
          you stay on track every day.
        </p>
      </section>
    </div>
  );
}