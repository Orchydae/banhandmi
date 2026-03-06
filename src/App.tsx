import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProfileHeader from './components/ProfileHeader/ProfileHeader'
import FeatureGrid from './components/FeatureGrid/FeatureGrid'
import SocialLinks from './components/SocialLinks/SocialLinks'
import TerminalPanel from './components/TerminalPanel/TerminalPanel'
import CategoryPage from './modules/CategoryPage/CategoryPage'
import { useTerminalLogs } from './hooks/useTerminalLogs'

const TREAT_MESSAGES = [
    'Thanks for the treato!',
    'Woah! You\'re so kind ~ Waf!',
    'Are you trying to get me fat?',
]

function App() {
    const { logs, addLog } = useTerminalLogs()

    const handleFeatureClick = (featureName: string) => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false })
        addLog({ timestamp, message: `Accessed module: ${featureName}` })
    }

    const handleFeed = () => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false })
        const message = TREAT_MESSAGES[Math.floor(Math.random() * TREAT_MESSAGES.length)]
        addLog({ timestamp, message })
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div className="app">
                        <ProfileHeader onFeed={handleFeed} />
                        <div className="app__center-col">
                            <FeatureGrid onFeatureClick={handleFeatureClick} />
                            <SocialLinks />
                        </div>
                        <TerminalPanel logs={logs} />
                    </div>
                }
            />
            <Route
                path="/dream-artifacts"
                element={<CategoryPage category="dream_artifact" />}
            />
            <Route
                path="/favorite-treats"
                element={<CategoryPage category="favorite_treat" />}
            />
            <Route
                path="/disapproved-items"
                element={<CategoryPage category="disapproved_item" />}
            />
        </Routes>
    )
}

export default App
