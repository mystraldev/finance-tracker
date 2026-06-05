// Semilla inicial (normalizada). Solo se usa la primera vez; a partir de ahí
// el estado vive en localStorage (ver store/FinanceProvider.jsx).
//
// Modelo:
// - accounts:      { id, name, type, icon, accent, openingBalance, interestRate? }
//                  El saldo NO se guarda: se deriva = openingBalance + Σ movimientos.
// - categories:    { id, label, color, icon }  (incluye 'income' para los ingresos)
// - transactions:  { id, accountId, categoryId, description, date 'yyyy-mm-dd', amount }
//                  amount con signo: negativo = gasto, positivo = ingreso.

export const accounts = [
  {
    id: 'checking',
    name: 'Cuenta corriente',
    type: 'cash',
    icon: 'wallet',
    accent: 'indigo',
    openingBalance: 1500,
  },
  {
    id: 'savings',
    name: 'Cuenta remunerada',
    type: 'savings',
    icon: 'piggy',
    accent: 'emerald',
    openingBalance: 12500,
    interestRate: 0.0275, // TAE
  },
  {
    id: 'investments',
    name: 'Inversiones',
    type: 'investment',
    icon: 'trending',
    accent: 'violet',
    openingBalance: 18340.18,
  },
]

export const categories = [
  { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
  { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home' },
  { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart' },
  { id: 'transport', label: 'Transporte', color: '#f59e0b', icon: 'car' },
  { id: 'leisure', label: 'Ocio', color: '#ec4899', icon: 'leisure' },
  { id: 'health', label: 'Salud', color: '#06b6d4', icon: 'health' },
  { id: 'other', label: 'Otros', color: '#94a3b8', icon: 'package' },
]

// --- Generación de ~6 meses de movimientos para que las gráficas y el
//     selector de mes tengan datos reales desde el primer momento. ---
const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

const EXPENSE_TEMPLATE = [
  { categoryId: 'home', description: 'Alquiler', base: 850, day: 2, fixed: true },
  { categoryId: 'food', description: 'Supermercado', base: 410, day: 8 },
  { categoryId: 'transport', description: 'Gasolina', base: 185, day: 11 },
  { categoryId: 'leisure', description: 'Ocio y restaurantes', base: 250, day: 16 },
  { categoryId: 'health', description: 'Farmacia', base: 95, day: 19 },
  { categoryId: 'other', description: 'Compras varias', base: 285, day: 23 },
]

// Variación por mes para dar vida a las tendencias (el alquiler queda fijo).
const VARIATION = [0.92, 1.08, 0.85, 1.12, 0.97, 1.0]

function buildTransactions() {
  const txs = []
  MONTHS.forEach((month, i) => {
    txs.push({
      id: `seed-${month}-income`,
      accountId: 'checking',
      categoryId: 'income',
      description: 'Nómina',
      date: `${month}-01`,
      amount: 3200,
    })
    EXPENSE_TEMPLATE.forEach((e) => {
      const factor = e.fixed ? 1 : VARIATION[i]
      const amount = Math.round(e.base * factor * 100) / 100
      txs.push({
        id: `seed-${month}-${e.categoryId}`,
        accountId: 'checking',
        categoryId: e.categoryId,
        description: e.description,
        date: `${month}-${String(e.day).padStart(2, '0')}`,
        amount: -amount,
      })
    })
  })
  return txs
}

export const transactions = buildTransactions()

export const seed = { accounts, categories, transactions }
