import './App.css'
import ProfileHeader from './components/ProfileHeader/ProfileHeader'
import StatsCounter from './components/StatsCounter/StatsCounter'
import FeatureGrid from './components/FeatureGrid/FeatureGrid'
import SocialLinks from './components/SocialLinks/SocialLinks'
import TerminalPanel from './components/TerminalPanel/TerminalPanel'

function App() {
    return (
        <div className="app">
            <ProfileHeader />
            <StatsCounter />
            <FeatureGrid />
            <SocialLinks />
            <TerminalPanel />
        </div>
    )
}

export default App
