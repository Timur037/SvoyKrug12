import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Onb1 } from './screens/onboarding/Onb1'
import { Onb2 } from './screens/onboarding/Onb2'
import { Onb3 } from './screens/onboarding/Onb3'
import { Quiz1 } from './screens/onboarding/Quiz1'
import { Quiz2 } from './screens/onboarding/Quiz2'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { GroupScreen } from './screens/GroupScreen'
import { BreathingScreen } from './screens/BreathingScreen'
import { PostEventScreen } from './screens/PostEventScreen'
import { BuildCircleScreen } from './screens/BuildCircleScreen'
import { CircleDetailScreen } from './screens/CircleDetailScreen'
import { UserProvider } from './context/UserContext'
import { posthog } from './lib/posthog'

function isOnboarded() {
  try {
    return localStorage.getItem('svoy_krug_onboarded') === '1'
  } catch {
    return false
  }
}

function RootRedirect() {
  return <Navigate to={isOnboarded() ? '/home' : '/onboarding/1'} replace />
}

function PostHogPageView() {
  const location = useLocation()
  useEffect(() => {
    if (typeof posthog?.capture === 'function') {
      posthog.capture('$pageview', { path: location.pathname })
    }
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <PostHogPageView />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding/1" element={<Onb1 />} />
          <Route path="/onboarding/2" element={<Onb2 />} />
          <Route path="/onboarding/3" element={<Onb3 />} />
          <Route path="/onboarding/quiz1" element={<Quiz1 />} />
          <Route path="/onboarding/quiz2" element={<Quiz2 />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/group" element={<GroupScreen />} />
          <Route path="/circle" element={<CircleDetailScreen />} />
          <Route path="/waiting" element={<BreathingScreen />} />
          <Route path="/post-event" element={<PostEventScreen />} />
          <Route path="/build-circle" element={<BuildCircleScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}
