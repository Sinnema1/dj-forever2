// No React import needed with new JSX transform

export default function Guestbook() {
  return (
    <div className="guestbook-container">
      <div className="guestbook-placeholder">
        <div className="guestbook-icon">💌</div>
        <h3 className="guestbook-title">Guestbook Coming Soon</h3>
        <p className="guestbook-description">
          We&apos;re preparing a special place for you to share your thoughts,
          memories, and well wishes for our big day. Check back soon!
        </p>
        <div className="guestbook-features">
          <div className="feature-item">
            <span className="feature-icon">✍️</span>
            <span>Share your memories</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💕</span>
            <span>Send us your wishes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📸</span>
            <span>Upload photos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
