import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProfileHeader from './components/ProfileHeader/ProfileHeader'
import FeatureGrid from './components/FeatureGrid/FeatureGrid'
import SocialLinks from './components/SocialLinks/SocialLinks'
import TerminalPanel from './components/TerminalPanel/TerminalPanel'
import DonorMarquee from './components/DonorMarquee/DonorMarquee'
import DonationSuccess from './components/DonationSuccess/DonationSuccess'
import CategoryPage from './modules/CategoryPage/CategoryPage'
import { useTerminalLogs } from './hooks/useTerminalLogs'
import { useLanguage } from './i18n/LanguageContext'

function App() {
    const { t } = useLanguage()
    const { logs, addLog } = useTerminalLogs(t)

    const TREAT_MESSAGES = [
        t('treat.msg1'),
        t('treat.msg2'),
        t('treat.msg3'),
    ]

    const handleFeatureClick = (featureName: string) => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false })
        addLog({ timestamp, message: `${t('terminal.accessed')} ${featureName}` })
    }

    const handleFeed = () => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false })
        const message = TREAT_MESSAGES[Math.floor(Math.random() * TREAT_MESSAGES.length)]
        addLog({ timestamp, message })
    }

    return (
        <>
        <DonorMarquee />
        <Routes>
            <Route
                path="/"
                element={
                    <div className="app">
                        <ProfileHeader onFeed={handleFeed} />
                        <div className="app__right-col">
                            <FeatureGrid onFeatureClick={handleFeatureClick} />
                            <SocialLinks />
                            <TerminalPanel logs={logs} />
                        </div>
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
            <Route path="/donation-success" element={<DonationSuccess />} />
        </Routes>
        </>
    )
}

export default App
