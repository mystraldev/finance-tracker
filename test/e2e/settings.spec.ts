import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ajustes')
  })

  test('loads the settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible()
    await expect(page.getByText('Preferencias')).toBeVisible()
  })

  test('shows data summary', async ({ page }) => {
    await expect(page.getByText(/cuentas/).first()).toBeVisible()
  })

  test('shows export and import buttons', async ({ page }) => {
    await expect(page.getByText('Exportar JSON')).toBeVisible()
    await expect(page.getByText('Importar JSON')).toBeVisible()
  })

  test('shows theme section with theme options', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tema' }).first()).toBeVisible()
    const themeGroup = page.getByRole('group', { name: 'Modo de tema' })
    await expect(themeGroup.getByText('Sistema')).toBeVisible()
    await expect(themeGroup.getByText('Claro')).toBeVisible()
    await expect(themeGroup.getByText('Oscuro')).toBeVisible()
  })

  test('theme toggle switches mode', async ({ page }) => {
    const themeGroup = page.getByRole('group', { name: 'Modo de tema' })
    await themeGroup.getByText('Oscuro').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await themeGroup.getByText('Claro').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('shows reset demo button', async ({ page }) => {
    await expect(page.getByText('Reiniciar demo')).toBeVisible()
  })

  test('reset demo opens confirmation dialog', async ({ page }) => {
    await page.getByText('Reiniciar demo').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Reiniciar datos' })).toBeVisible()
  })
})
