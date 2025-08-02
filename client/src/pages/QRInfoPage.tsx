import React from "react";

const QRInfoPage: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        lineHeight: "1.6",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        How to Use Your QR Code
      </h1>

      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h2>What is a QR Code?</h2>
        <p>
          A QR (Quick Response) code is a type of barcode that contains
          information. For our wedding website, your QR code contains a special
          link that automatically logs you in.
        </p>
      </div>

      <h2>How to Scan Your QR Code</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            alignItems: "center",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            1
          </div>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Find Your Invitation</h3>
            <p style={{ margin: 0 }}>
              Locate your save-the-date card or wedding invitation.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            alignItems: "center",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            2
          </div>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Open Your Phone's Camera</h3>
            <p style={{ margin: 0 }}>
              On most modern smartphones, the built-in camera app can scan QR
              codes. Simply open your camera app.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            alignItems: "center",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            3
          </div>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Point Camera at QR Code</h3>
            <p style={{ margin: 0 }}>
              Point your camera at the QR code square on your invitation and
              hold steady. Your phone should recognize it automatically.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            alignItems: "center",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            4
          </div>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Tap the Notification</h3>
            <p style={{ margin: 0 }}>
              A notification or link should appear on your screen. Tap it to be
              taken directly to our wedding website.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#e8f5e9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          border: "1px solid #c8e6c9",
        }}
      >
        <h2 style={{ color: "#2e7d32" }}>What Makes This Special</h2>
        <p>
          Your QR code is unique to you! When you scan it, our website
          recognizes you automatically, giving you a personalized experience and
          access to RSVP features.
        </p>
        <p>No need to remember usernames, passwords, or create an account.</p>
      </div>

      <h2>Troubleshooting</h2>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          marginBottom: "20px",
        }}
      >
        <h3>QR Code Not Scanning?</h3>
        <ul>
          <li>Make sure there's good lighting</li>
          <li>Hold your phone steady</li>
          <li>Make sure the entire QR code is visible</li>
          <li>Clean your camera lens</li>
          <li>
            Try a dedicated QR code scanning app if your camera app doesn't work
          </li>
        </ul>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h3>Still Having Trouble?</h3>
        <p>
          Contact us at{" "}
          <a href="mailto:wedding@example.com">wedding@example.com</a> and we'll
          help you access the website.
        </p>
      </div>
    </div>
  );
};

export default QRInfoPage;
