import './App.css'
import ProfileHeader from './components/ProfileHeader'
import StatsCounter from './components/StatsCounter'
import FeatureGrid from './components/FeatureGrid'
import SocialLinks from './components/SocialLinks'
import TerminalPanel from './components/TerminalPanel'

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
