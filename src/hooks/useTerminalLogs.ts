import { useState, useCallback } from 'react'
import type { LogEntry } from '../components/TerminalPanel/TerminalPanel'

const INITIAL_LOGS: LogEntry[] = [
    { id: 'init-1', message: 'Initializing bio-link protocol...' },
    { id: 'init-2', message: 'Scanning for dream frequencies...' },
    { id: 'init-3', message: 'Status: Stable', isStatus: true },
]

export function useTerminalLogs() {
    const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)

    const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
        setLogs((prev) => [
            ...prev,
            { ...entry, id: `log-${Date.now()}-${Math.random()}` },
        ])
    }, [])

    return { logs, addLog }
}
