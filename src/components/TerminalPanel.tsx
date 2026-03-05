import './TerminalPanel.css'

export default function TerminalPanel() {
    return (
        <div className="terminal-panel" id="terminal-panel">
            <div className="terminal-panel__header">
                <span className="terminal-panel__dot terminal-panel__dot--red" />
                <span className="terminal-panel__dot terminal-panel__dot--yellow" />
                <span className="terminal-panel__dot terminal-panel__dot--green" />
                <span className="terminal-panel__title">banh@system.cfg</span>
            </div>
            <div className="terminal-panel__body">
                <span className="terminal-panel__line">
                    <span className="terminal-panel__prompt">&gt; </span>
                    Initializing bio-link protocol...
                </span>
                <span className="terminal-panel__line">
                    <span className="terminal-panel__prompt">&gt; </span>
                    Scanning for dream frequencies...
                </span>
                <span className="terminal-panel__line terminal-panel__line--status">
                    <span className="terminal-panel__prompt">&gt; </span>
                    Status: Stable
                </span>
            </div>
        </div>
    )
}
