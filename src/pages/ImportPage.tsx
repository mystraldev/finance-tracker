import type { ImportPlan } from '../utils/statementImport'

import { useState } from 'react'

import Icon from '../components/Icon'
import * as supabaseRepo from '../data/supabaseFinanceRepo'
import { extractPdfLines } from '../lib/pdfText'
import { useAuth } from '../store/authContext'
import { useFinance } from '../store/financeContext'
import { formatCurrency } from '../utils/format'
import { buildImportPlan } from '../utils/statementImport'
import { parseRevolutStatement } from '../utils/statementParser'

type Phase = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

type LabelMap = Map<string, string>

function Dropzone({ onFile }: { onFile: (file: File) => void }) {
  return (
    <label className="import-drop">
      <input
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
        }}
        type="file"
      />
      <Icon name="upload" size={28} />
      <span className="import-drop__title">Sube tu extracto PDF</span>
      <span className="import-drop__hint">
        Revolut · cuentas en euros · el archivo no sale de tu navegador
      </span>
    </label>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="import-stat">
      <span className="import-stat__value">{value}</span>
      <span className="import-stat__label">{label}</span>
    </div>
  )
}

type PreviewProperties = {
  plan: ImportPlan
  accountName: LabelMap
  categoryLabel: LabelMap
  onConfirm: () => void
  onCancel: () => void
}

function Preview({ plan, accountName, categoryLabel, onConfirm, onCancel }: PreviewProperties) {
  const sample = plan.newTransactions.slice(0, 8)
  const rest = plan.newTransactions.length - sample.length

  return (
    <div className="import-preview">
      <div className="import-stats">
        <Stat label="movimientos nuevos" value={plan.newTransactions.length} />
        <Stat label="cuentas nuevas" value={plan.newAccounts.length} />
        <Stat label="categorías nuevas" value={plan.newCategories.length} />
        <Stat label="duplicados omitidos" value={plan.duplicates} />
      </div>

      {plan.newAccounts.length > 0 && (
        <ul className="import-accounts">
          {plan.newAccounts.map((account) => (
            <li className="import-account" key={account.id}>
              <span className="import-account__name">{account.name}</span>
              <span className="import-account__balance">{formatCurrency(account.openingBalance)}</span>
            </li>
          ))}
        </ul>
      )}

      {sample.length > 0 && (
        <table className="import-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Cuenta</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {sample.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.description}</td>
                <td>{categoryLabel.get(tx.categoryId) ?? '—'}</td>
                <td>{accountName.get(tx.accountId) ?? '—'}</td>
                <td className={tx.amount < 0 ? 'is-expense' : 'is-income'}>{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rest > 0 && <p className="import-more">…y {rest} movimientos más</p>}

      <div className="form__actions">
        <button className="btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button
          className="btn-primary"
          disabled={plan.newTransactions.length === 0}
          onClick={onConfirm}
          type="button"
        >
          Importar {plan.newTransactions.length} movimientos
        </button>
      </div>
    </div>
  )
}

type BodyProperties = PreviewProperties & {
  phase: Phase
  error: string | undefined
  onFile: (file: File) => void
}

function ImportBody({ phase, plan, error, accountName, categoryLabel, onFile, onConfirm, onCancel }: BodyProperties) {
  if (phase === 'parsing') return <p className="import-status">Leyendo el PDF…</p>
  if (phase === 'importing') return <p className="import-status">Guardando tus movimientos…</p>
  if (phase === 'done') {
    return (
      <div className="import-status">
        <p>✓ Movimientos importados correctamente.</p>
        <button className="btn-primary" onClick={() => location.assign('/')} type="button">
          Ver el dashboard
        </button>
      </div>
    )
  }
  if (phase === 'error') {
    return (
      <div className="import-status">
        <p className="form__error">{error}</p>
        <button className="btn-ghost" onClick={onCancel} type="button">
          Volver
        </button>
      </div>
    )
  }
  if (phase === 'preview') {
    return (
      <Preview
        accountName={accountName}
        categoryLabel={categoryLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
        plan={plan}
      />
    )
  }
  return <Dropzone onFile={onFile} />
}

export default function ImportPage() {
  const { user } = useAuth()
  const { accounts, categories, transactions } = useFinance()
  const [phase, setPhase] = useState<Phase>('idle')
  const [plan, setPlan] = useState<ImportPlan | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const accountName: LabelMap = new Map(
    [...accounts, ...(plan?.newAccounts ?? [])].map((a): [string, string] => [a.id, a.name]),
  )
  const categoryLabel: LabelMap = new Map(
    [...categories, ...(plan?.newCategories ?? [])].map((c): [string, string] => [c.id, c.label]),
  )

  async function handleFile(file: File) {
    setError(undefined)
    setPhase('parsing')
    try {
      const lines = await extractPdfLines(file)
      const statement = parseRevolutStatement(lines)
      if (statement.accounts.length === 0) {
        setError('No se han encontrado cuentas en euros. ¿Es un extracto consolidado de Revolut?')
        setPhase('error')
        return
      }
      setPlan(buildImportPlan(statement, { accounts, categories, transactions }))
      setPhase('preview')
    } catch (error) {
      setError(
        error instanceof Error ? `No se ha podido leer el PDF: ${error.message}` : 'No se ha podido leer el PDF.',
      )
      setPhase('error')
    }
  }

  async function handleConfirm() {
    if (!plan || !user) return
    setPhase('importing')
    try {
      await supabaseRepo.bulkInsert(user.id, {
        accounts: plan.newAccounts,
        categories: plan.newCategories,
        transactions: plan.newTransactions,
      })
      setPhase('done')
    } catch {
      setError('No se han podido guardar los movimientos.')
      setPhase('error')
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Datos</p>
          <h1 className="page-header__title">Importar extracto</h1>
          <p className="page-header__description">
            Sube un PDF de Revolut y añade tus movimientos automáticamente.
          </p>
        </div>
      </header>

      <section className="card import-card">
        <ImportBody
          accountName={accountName}
          categoryLabel={categoryLabel}
          error={error}
          onCancel={() => {
            setPlan(undefined)
            setPhase('idle')
          }}
          onConfirm={() => void handleConfirm()}
          onFile={(file) => void handleFile(file)}
          phase={phase}
          plan={plan ?? { newAccounts: [], newCategories: [], newTransactions: [], duplicates: 0, totalParsed: 0 }}
        />
      </section>
    </>
  )
}
