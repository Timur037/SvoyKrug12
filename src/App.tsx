import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Onb1 } from './screens/onboarding/Onb1'
import { Onb2 } from './screens/onboarding/Onb2'
import { Onb3 } from './screens/onboarding/Onb3'
import { Quiz1 } from './screens/onboarding/Quiz1'
import { Quiz2 } from './screens/onboarding/Quiz2'
import { Quiz3 } from './screens/onboarding/Quiz3'
import { Quiz4 } from './screens/onboarding/Quiz4'
import { Quiz5 } from './screens/onboarding/Quiz5'
import { OnbHobbies } from './screens/onboarding/OnbHobbies'
import { OnbQualities } from './screens/onboarding/OnbQualities'
import { OnbName } from './screens/onboarding/OnbName'
import { OnbGender } from './screens/onboarding/OnbGender'
import { OnbAge } from './screens/onboarding/OnbAge'
import { OnbWork } from './screens/onboarding/OnbWork'
import { OnbDistrict } from './screens/onboarding/OnbDistrict'
import { OnbRelationship } from './screens/onboarding/OnbRelationship'
import { OnbChildren } from './screens/onboarding/OnbChildren'
import { OnbYourQualities } from './screens/onboarding/OnbYourQualities'
import { OnbBudget } from './screens/onboarding/OnbBudget'
import { OnbDone } from './screens/onboarding/OnbDone'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { GroupScreen } from './screens/GroupScreen'
import { BreathingScreen } from './screens/BreathingScreen'
import { PostEventScreen } from './screens/PostEventScreen'
import { BuildCircleScreen } from './screens/BuildCircleScreen'
import { CircleDetailScreen } from './screens/CircleDetailScreen'
import { GroupChatScreen } from './screens/GroupChatScreen'
import { FormatsScreen } from './screens/FormatsScreen'
import { GamesScreen } from './screens/GamesScreen'
import { BelieveItGame } from './screens/games/BelieveItGame'
import { GuessWhoGame } from './screens/games/GuessWhoGame'
import { MostLikelyGame } from './screens/games/MostLikelyGame'
import { HotSeatGame } from './screens/games/HotSeatGame'
import { StoryGame } from './screens/games/StoryGame'
import { UserProvider } from './context/UserContext'
import { posthog } from './lib/posthog'

function RootRedirect() {
  return <Navigate to="/onboarding/1" replace />
}

// Handles deep-links from Telegram bot messages.
// If the bot sends a button with startapp=review_MEETUPID,
// we save the meetup id and navigate to /post-event automatically.
function StartParamHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    try {
      const param = window.Telegram?.WebApp?.initDataUnsafe?.start_param ?? ''
      if (param.startsWith('review_')) {
        const meetupId = param.replace('review_', '')
        localStorage.setItem('svoy_krug_review_meetup', meetupId)
        navigate('/post-event', { replace: true })
      }
    } catch {
      // ignore — not in Telegram context
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
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
        <StartParamHandler />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding/1" element={<Onb1 />} />
          <Route path="/onboarding/2" element={<Onb2 />} />
          <Route path="/onboarding/3" element={<Onb3 />} />
          <Route path="/onboarding/quiz1" element={<Quiz1 />} />
          <Route path="/onboarding/quiz2" element={<Quiz2 />} />
          <Route path="/onboarding/quiz3" element={<Quiz3 />} />
          <Route path="/onboarding/quiz4" element={<Quiz4 />} />
          <Route path="/onboarding/quiz5" element={<Quiz5 />} />
          <Route path="/onboarding/hobbies" element={<OnbHobbies />} />
          <Route path="/onboarding/qualities" element={<OnbQualities />} />
          <Route path="/onboarding/name" element={<OnbName />} />
          <Route path="/onboarding/gender" element={<OnbGender />} />
          <Route path="/onboarding/age" element={<OnbAge />} />
          <Route path="/onboarding/work" element={<OnbWork />} />
          <Route path="/onboarding/district" element={<OnbDistrict />} />
          <Route path="/onboarding/relationship" element={<OnbRelationship />} />
          <Route path="/onboarding/children" element={<OnbChildren />} />
          <Route path="/onboarding/your-qualities" element={<OnbYourQualities />} />
          <Route path="/onboarding/budget" element={<OnbBudget />} />
          <Route path="/onboarding/done" element={<OnbDone />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/group" element={<GroupScreen />} />
          <Route path="/circle" element={<CircleDetailScreen />} />
          <Route path="/chat" element={<GroupChatScreen />} />
          <Route path="/formats" element={<FormatsScreen />} />
          <Route path="/games" element={<GamesScreen />} />
          <Route path="/games/believe-it" element={<BelieveItGame />} />
          <Route path="/games/guess-who" element={<GuessWhoGame />} />
          <Route path="/games/most-likely" element={<MostLikelyGame />} />
          <Route path="/games/hot-seat" element={<HotSeatGame />} />
          <Route path="/games/story" element={<StoryGame />} />
          <Route path="/waiting" element={<BreathingScreen />} />
          <Route path="/post-event" element={<PostEventScreen />} />
          <Route path="/build-circle" element={<BuildCircleScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}
