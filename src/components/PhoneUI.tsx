import './PhoneUI.css'

interface Props {
  isActive: boolean
  isMuted: boolean
  onStart: () => void
  onStop: () => void
  onToggleMute: () => void
}

export default function PhoneUI({ isActive, isMuted, onStart, onStop, onToggleMute }: Props) {
  return (
    <div className="phone-ui">
      <div className="phone-ui-top">
        <button className="phone-btn phone-btn-back" aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="phone-btn phone-btn-sparkle" aria-label="Effects">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="phone-ui-bottom">
        {isActive ? (
          <>
            <button
              className={`phone-btn phone-btn-speaker ${isMuted ? 'phone-btn-muted' : ''}`}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              onClick={onToggleMute}
            >
              {isMuted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5z" />
                </svg>
              )}
            </button>
            <button className="phone-btn-stop" onClick={onStop}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="6" width="3" height="12" rx="1" />
                <rect x="7" y="3" width="3" height="18" rx="1" />
                <rect x="12" y="8" width="3" height="8" rx="1" />
                <rect x="17" y="4" width="3" height="16" rx="1" />
              </svg>
              <span>Stop</span>
            </button>
          </>
        ) : (
          <button className="phone-btn-start" onClick={onStart}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>Start Listening</span>
          </button>
        )}
      </div>
    </div>
  )
}
