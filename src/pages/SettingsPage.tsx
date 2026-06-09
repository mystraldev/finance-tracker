import { useRef, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Icon from '../components/Icon'
import {
  createFinanceBackup,
  parseFinanceBackup,
} from '../data/financeRepository'
import { useFinance } from '../store/financeContext'
import { useTheme } from '../store/themeContext'
import type { ThemeMode } from '../store/theme'

const THEME_OPTIONS: Array<{ mode: ThemeMode; label: string; icon: string }> = [
  { mode: 'system', label: 'Sistema', icon: 'system' },
  { mode: 'light', label: 'Claro', icon: 'sun' },
  { mode: 'dark', label: 'Oscuro', icon: 'moon' },
]

type Status = {
  type: 'success' | 'error'
  message: string
}

function backupFileName() {
  const stamp = new Date().toISOString().slice(0, 10)
  return `finance-tracker-backup-${stamp}.json`
}

function SettingsPage() {
  const { accounts, categories, transactions, importData, reset } = useFinance()
  const { mode, theme, systemTheme, setMode } = useTheme()
  const [status, setStatus] = useState<Status | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleExport() {
    const backup = createFinanceBackup({ accounts, categories, transactions })
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    link.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'success', message: 'Backup exportado correctamente.' })
  }

  async function handleImport(file: File | undefined) {
    if (!file) return

    try {
      const parsed = parseFinanceBackup(JSON.parse(await file.text()))
      if (!parsed) {
        setStatus({ type: 'error', message: 'El archivo no tiene un backup válido.' })
        return
      }

      importData(parsed)
      setStatus({ type: 'success', message: 'Datos importados correctamente.' })
    } catch {
      setStatus({ type: 'error', message: 'No se ha podido leer el archivo JSON.' })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleReset() {
    reset()
    setConfirmingReset(false)
    setStatus({ type: 'success', message: 'Datos restaurados al estado demo.' })
  }

  const themeLabel =
    mode === 'system'
      ? `Sistema (${systemTheme === 'dark' ? 'oscuro' : 'claro'})`
      : mode === 'dark'
        ? 'Oscuro'
        : 'Claro'

  return (
    <>
      <header className="page-header settings-header">
        <div>
          <p className="page-header__greeting">Preferencias</p>
          <h1 className="page-header__title">Ajustes</h1>
          <p className="page-header__description">Tema actual: {themeLabel}</p>
        </div>
      </header>

      {status && (
        <div className={`notice notice--${status.type}`} role="status">
          {status.message}
        </div>
      )}

      <section className="settings-grid">
        <article className="card settings-card">
          <div className="settings-card__head">
            <span className="icon-tile icon-tile--indigo">
              <Icon name="database" size={20} />
            </span>
            <div>
              <h2 className="card__title">Datos locales</h2>
              <p className="settings-card__copy">
                {accounts.length} cuentas · {categories.length} categorías · {transactions.length}{' '}
                movimientos
              </p>
            </div>
          </div>

          <div className="settings-actions">
            <button type="button" className="btn-primary" onClick={handleExport}>
              <Icon name="download" size={18} strokeWidth={2.2} />
              Exportar JSON
            </button>
            <button type="button" className="btn-ghost" onClick={() => inputRef.current?.click()}>
              <Icon name="upload" size={18} strokeWidth={2.2} />
              Importar JSON
            </button>
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label="Seleccionar backup JSON"
              onChange={(event) => void handleImport(event.target.files?.[0])}
            />
          </div>
        </article>

        <article className="card settings-card">
          <div className="settings-card__head">
            <span className="icon-tile icon-tile--emerald">
              <Icon name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sun' : 'system'} size={20} />
            </span>
            <div>
              <h2 className="card__title">Tema</h2>
              <p className="settings-card__copy">
                Interfaz {theme === 'dark' ? 'oscura' : 'clara'}
              </p>
            </div>
          </div>

          <div className="theme-segmented" role="group" aria-label="Modo de tema">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                className={`theme-segmented__btn${mode === option.mode ? ' is-active' : ''}`}
                aria-pressed={mode === option.mode}
                onClick={() => setMode(option.mode)}
              >
                <Icon name={option.icon} size={17} />
                {option.label}
              </button>
            ))}
          </div>
        </article>

        <article className="card settings-card settings-card--danger">
          <div className="settings-card__head">
            <span className="icon-tile settings-card__danger-icon">
              <Icon name="reset" size={20} />
            </span>
            <div>
              <h2 className="card__title">Reiniciar datos</h2>
              <p className="settings-card__copy">Restaura las cuentas, categorías y movimientos demo.</p>
            </div>
          </div>

          <button type="button" className="btn-danger" onClick={() => setConfirmingReset(true)}>
            <Icon name="reset" size={18} strokeWidth={2.2} />
            Reiniciar demo
          </button>
        </article>
      </section>

      {confirmingReset && (
        <ConfirmDialog
          title="Reiniciar datos"
          message="Se reemplazarán tus datos locales por los datos demo incluidos en la app."
          confirmLabel="Reiniciar"
          onConfirm={handleReset}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </>
  )
}

export default SettingsPage
