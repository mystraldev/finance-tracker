import { expect, test } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/movimientos')
  })

  test('loads the transactions page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Movimientos' })).toBeVisible()
    await expect(page.getByText('Tus finanzas')).toBeVisible()
  })

  test('shows transaction list with seed data', async ({ page }) => {
    await expect(page.getByText('Nómina').first()).toBeVisible()
  })

  test('shows summary stats', async ({ page }) => {
    await expect(page.getByLabel('Resumen filtrado').getByText('Movimientos')).toBeVisible()
    await expect(page.getByLabel('Resumen filtrado').getByText('Ingresos')).toBeVisible()
    await expect(page.getByLabel('Resumen filtrado').getByText('Gastos')).toBeVisible()
    await expect(page.getByLabel('Resumen filtrado').getByText('Neto')).toBeVisible()
  })

  test('filters by type', async ({ page }) => {
    const typeSelect = page.getByLabel('Tipo')
    await typeSelect.selectOption('gasto')
    await expect(page.getByText('Nómina')).toBeHidden()
  })

  test('search filters the list', async ({ page }) => {
    const search = page.getByPlaceholder('Buscar movimientos')
    await search.fill('Alquiler')
    await expect(page.getByText('Alquiler').first()).toBeVisible()
  })

  test('opens add transaction modal', async ({ page }) => {
    await page.getByText('Añadir movimiento').click()
    await expect(page.getByText('Nuevo movimiento')).toBeVisible()
  })
})
