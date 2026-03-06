import { useState, useCallback } from 'react'
import type { LogEntry } from '../components/TerminalPanel/TerminalPanel'

const STORAGE_KEY = 'banhandmi:terminal-logs'

const INITIAL_LOGS: LogEntry[] = [
    { id: 'init-1', message: 'Initializing bio-link protocol...' },
    { id: 'init-2', message: 'Scanning for dream frequencies...' },
    { id: 'init-3', message: 'Status: Stable', isStatus: true },
]

function loadLogs(): LogEntry[] {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw) as LogEntry[]
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch {
        // ignore parse errors
    }
    // First visit this session — seed with initial logs
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOGS))
    return INITIAL_LOGS
}

function saveLogs(logs: LogEntry[]) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
    } catch {
        // ignore storage errors (e.g. private mode limits)
    }
}

export function useTerminalLogs() {
    const [logs, setLogs] = useState<LogEntry[]>(loadLogs)

    const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
        setLogs((prev) => {
            const next = [
                ...prev,
                { ...entry, id: `log-${Date.now()}-${Math.random()}` },
            ]
            saveLogs(next)
            return next
        })
    }, [])

    return { logs, addLog }
}
