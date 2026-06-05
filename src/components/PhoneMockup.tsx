import type { ReactNode } from 'react'
import './PhoneMockup.css'

interface Props {
  children: ReactNode
}

export default function PhoneMockup({ children }: Props) {
  return (
    <div className="phone-mockup">
      <div className="phone-bezel">
        <div className="phone-notch" />
        <div className="phone-screen">
          {children}
        </div>
      </div>
    </div>
  )
}
