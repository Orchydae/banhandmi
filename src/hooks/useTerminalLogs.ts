import { useState, useCallback } from 'react'
import type { LogEntry } from '../components/TerminalPanel/TerminalPanel'
import type { TranslationKey } from '../i18n/translations'

export function useTerminalLogs(t: (key: TranslationKey) => string) {
    const INITIAL_LOGS: LogEntry[] = [
        { id: 'init-1', message: t('terminal.init1') },
        { id: 'init-2', message: t('terminal.init2') },
        { id: 'init-3', message: t('terminal.init3'), isStatus: true },
    ]

    const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)

    const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
        setLogs((prev) => [
            ...prev,
            { ...entry, id: `log-${Date.now()}-${Math.random()}` },
        ])
    }, [])

    return { logs, addLog }
}
