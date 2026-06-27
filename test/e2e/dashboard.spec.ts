import { expect, test } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with greeting and title', async ({ page }) => {
    await expect(page.getByText('Hola, Ferran')).toBeVisible()
    await expect(page.getByText('Tu resumen financiero')).toBeVisible()
  })

  test('shows net worth hero', async ({ page }) => {
    await expect(page.getByText('Patrimonio total')).toBeVisible()
    await expect(page.locator('.hero__amount')).toBeVisible()
  })

  test('shows account summary cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cuenta corriente' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cuenta remunerada' })).toBeVisible()
  })

  test('shows savings rate section', async ({ page }) => {
    await expect(page.getByText('Tasa de ahorro')).toBeVisible()
  })

  test('shows recent transactions', async ({ page }) => {
    await expect(page.getByText('Movimientos recientes')).toBeVisible()
  })

  test('shows category breakdown', async ({ page }) => {
    await expect(page.getByText('Gastos por categoría')).toBeVisible()
  })

  test('shows budgets section', async ({ page }) => {
    await expect(page.getByText('Presupuestos')).toBeVisible()
  })

  test('has a visible sidebar with navigation links', async ({ page }) => {
    await expect(page.getByText('Finance Tracker')).toBeVisible()
    const links = page.locator('.sidebar__nav a')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('navigates to transactions page via sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Movimientos' }).click()
    await expect(page).toHaveURL('/movimientos')
    await expect(page.getByRole('heading', { name: 'Movimientos' })).toBeVisible()
  })

  test('navigates to categories page via sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Categorías' }).click()
    await expect(page).toHaveURL('/categorias')
    await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible()
  })

  test('navigates to accounts page via sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Cuentas' }).click()
    await expect(page).toHaveURL('/cuentas')
    await expect(page.getByRole('heading', { name: 'Cuentas' })).toBeVisible()
  })

  test('navigates to settings page via sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Ajustes' }).click()
    await expect(page).toHaveURL('/ajustes')
    await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible()
  })
})
