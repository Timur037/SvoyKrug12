import { type ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <>
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter {
          animation: pageEnter 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
      <div className="page-enter" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </>
  )
}
