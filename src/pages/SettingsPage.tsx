import type { ThemeMode } from '../store/theme'
import type { FinanceData } from '../types/finance'

import { useRef, useState } from 'react'

import ConfirmDialog from '../components/ConfirmDialog'
import Icon from '../components/Icon'
import {
  createFinanceBackup,
  parseFinanceBackup,
} from '../data/financeRepo'
import { useFinance } from '../store/financeContext'
import { useTheme } from '../store/themeContext'

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

function getThemeLabel(mode: ThemeMode, systemTheme: string) {
  if (mode === 'system') {
    return `Sistema (${systemTheme === 'dark' ? 'oscuro' : 'claro'})`
  }
  if (mode === 'dark') return 'Oscuro'
  return 'Claro'
}

function getThemeIcon(mode: ThemeMode) {
  if (mode === 'dark') return 'moon'
  if (mode === 'light') return 'sun'
  return 'system'
}

function handleExport(
  data: Pick<FinanceData, 'accounts' | 'categories' | 'transactions' | 'savingsGoals'>,
  setStatus: (status: Status | undefined) => void,
) {
  const backup = createFinanceBackup(data)
  // eslint-disable-next-line unicorn/no-null
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

async function handleImport(
  file: File | undefined,
  setStatus: (status: Status | undefined) => void,
  setPendingImport: (data: FinanceData | undefined) => void,
  inputElement: HTMLInputElement | null,
) {
  if (!file) return

  try {
    const parsed = parseFinanceBackup(JSON.parse(await file.text()))
    if (!parsed) {
      setStatus({ type: 'error', message: 'El archivo no tiene un backup válido.' })
      return
    }

    setPendingImport(parsed)
  } catch {
    setStatus({ type: 'error', message: 'No se ha podido leer el archivo JSON.' })
  } finally {
    if (inputElement) inputElement.value = ''
  }
}

function handleConfirmImport(
  pendingImport: FinanceData | undefined,
  importData: (data: FinanceData) => void,
  setPendingImport: (data: FinanceData | undefined) => void,
  setStatus: (status: Status | undefined) => void,
) {
  if (!pendingImport) return
  importData(pendingImport)
  setPendingImport(undefined)
  setStatus({ type: 'success', message: 'Datos importados correctamente.' })
}

function handleReset(
  reset: () => void,
  setConfirmingReset: (isConfirming: boolean) => void,
  setStatus: (status: Status | undefined) => void,
) {
  reset()
  setConfirmingReset(false)
  setStatus({ type: 'success', message: 'Datos restaurados al estado demo.' })
}

function BackupDataCard({
  accountsLength,
  categoriesLength,
  transactionsLength,
  savingsGoalsLength,
  onExport,
  onImport,
}: {
  accountsLength: number
  categoriesLength: number
  transactionsLength: number
  savingsGoalsLength: number
  onExport: () => void
  onImport: () => void
}) {
  return (
    <article className="card settings-card">
      <div className="settings-card__head">
        <span className="icon-tile icon-tile--indigo">
          <Icon name="database" size={20} />
        </span>
        <div>
          <h2 className="card__title">Datos locales</h2>
          <p className="settings-card__copy">
            {accountsLength} cuentas · {categoriesLength} categorías · {transactionsLength}{' '}
            movimientos · {savingsGoalsLength} objetivos
          </p>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={onExport} type="button">
          <Icon name="download" size={18} strokeWidth={2.2} />
          Exportar JSON
        </button>
        <button className="btn-ghost" onClick={onImport} type="button">
          <Icon name="upload" size={18} strokeWidth={2.2} />
          Importar JSON
        </button>
      </div>
    </article>
  )
}

function ImportConfirmDialog({
  pendingImport,
  onConfirm,
  onCancel,
}: {
  pendingImport: FinanceData
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <ConfirmDialog
      confirmLabel="Importar"
      message={`Se reemplazarán tus datos actuales por los del backup: ${pendingImport.accounts.length} cuentas, ${pendingImport.categories.length} categorías, ${pendingImport.transactions.length} movimientos y ${pendingImport.savingsGoals.length} objetivos.`}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Importar backup"
    />
  )
}

function SettingsPage() {
  const { accounts, categories, transactions, savingsGoals, importData, reset } = useFinance()
  const { mode, theme, systemTheme, setMode } = useTheme()
  const [status, setStatus] = useState<Status | undefined>(undefined)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [pendingImport, setPendingImport] = useState<FinanceData | undefined>(undefined)
  const inputReference = useRef<HTMLInputElement | undefined>(undefined)

  return (
    <>
      <header className="page-header settings-header">
        <div>
          <p className="page-header__greeting">Preferencias</p>
          <h1 className="page-header__title">Ajustes</h1>
          <p className="page-header__description">Tema actual: {getThemeLabel(mode, systemTheme)}</p>
        </div>
      </header>

      {status && (
        <div className={`notice notice--${status.type}`} role="status">
          {status.message}
        </div>
      )}

      <section className="settings-grid">
        <BackupDataCard
          accountsLength={accounts.length}
          categoriesLength={categories.length}
          onExport={() => handleExport({ accounts, categories, transactions, savingsGoals }, setStatus)}
          onImport={() => inputReference.current?.click()}
          savingsGoalsLength={savingsGoals.length}
          transactionsLength={transactions.length}
        />

        <input
          accept="application/json,.json"
          aria-label="Seleccionar backup JSON"
          className="sr-only"
          onChange={(event) => void handleImport(event.target.files?.[0], setStatus, setPendingImport, inputReference.current)}
          ref={inputReference}
          type="file"
        />

        <article className="card settings-card">
          <div className="settings-card__head">
            <span className="icon-tile icon-tile--emerald">
              <Icon name={getThemeIcon(mode)} size={20} />
            </span>
            <div>
              <h2 className="card__title">Tema</h2>
              <p className="settings-card__copy">
                Interfaz {theme === 'dark' ? 'oscura' : 'clara'}
              </p>
            </div>
          </div>

          <div aria-label="Modo de tema" className="theme-segmented" role="group">
            {THEME_OPTIONS.map((option) => (
              <button
                aria-pressed={mode === option.mode}
                className={`theme-segmented__btn${mode === option.mode ? ' is-active' : ''}`}
                key={option.mode}
                onClick={() => setMode(option.mode)}
                type="button"
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

          <button className="btn-danger" onClick={() => setConfirmingReset(true)} type="button">
            <Icon name="reset" size={18} strokeWidth={2.2} />
            Reiniciar demo
          </button>
        </article>
      </section>

      {pendingImport && (
        <ImportConfirmDialog
          onCancel={() => setPendingImport(undefined)}
          onConfirm={() => handleConfirmImport(pendingImport, importData, setPendingImport, setStatus)}
          pendingImport={pendingImport}
        />
      )}

      {confirmingReset && (
        <ConfirmDialog
          confirmLabel="Reiniciar"
          message="Se reemplazarán tus datos locales por los datos demo incluidos en la app."
          onCancel={() => setConfirmingReset(false)}
          onConfirm={() => handleReset(reset, setConfirmingReset, setStatus)}
          title="Reiniciar datos"
        />
      )}
    </>
  )
}

export default SettingsPage
