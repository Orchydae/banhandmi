import './TerminalPanel.css'
import { SquareChevronRight } from 'lucide-react'

export interface LogEntry {
    id: string;
    timestamp?: string;
    message: string;
    isStatus?: boolean;
}

interface TerminalPanelProps {
    logs: LogEntry[];
}

export default function TerminalPanel({ logs }: TerminalPanelProps) {
    return (
        <div className="terminal-panel" id="terminal-panel">
            <div className="terminal-panel__header">
                <SquareChevronRight size={16} />
                <span className="terminal-panel__title">DREAM_SYSTEM_LOG</span>
            </div>
            <div className="terminal-panel__body">
                {logs.map((log) => (
                    <span key={log.id} className={`terminal-panel__line ${log.isStatus ? 'terminal-panel__line--status' : ''}`}>
                        <span className="terminal-panel__prompt">&gt; </span>
                        {log.timestamp ? `[${log.timestamp}] ` : ''}
                        {log.message}
                    </span>
                ))}
            </div>
        </div>
    )
}
