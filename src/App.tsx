import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProfileHeader from './components/ProfileHeader/ProfileHeader'
import FeatureGrid from './components/FeatureGrid/FeatureGrid'
import SocialLinks from './components/SocialLinks/SocialLinks'
import TerminalPanel, { LogEntry } from './components/TerminalPanel/TerminalPanel'
import CategoryPage from './modules/CategoryPage/CategoryPage'

const INITIAL_LOGS: LogEntry[] = [
    { id: 'init-1', message: 'Initializing bio-link protocol...' },
    { id: 'init-2', message: 'Scanning for dream frequencies...' },
    { id: 'init-3', message: 'Status: Stable', isStatus: true },
]

function App() {
    const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)

    const handleFeatureClick = (featureName: string) => {
        const now = new Date()
        const timestamp = now.toLocaleTimeString([], { hour12: false })

        setLogs((prevLogs) => [
            ...prevLogs,
            {
                id: `log-${Date.now()}-${Math.random()}`,
                timestamp,
                message: `Accessed module: ${featureName}`
            }
        ])
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div className="app">
                        <ProfileHeader />
                        <FeatureGrid onFeatureClick={handleFeatureClick} />
                        <SocialLinks />
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
