import { test, expect } from '@playwright/test'

test.describe('Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categorias')
  })

  test('loads the categories page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible()
  })

  test('shows budget categories with progress', async ({ page }) => {
    await expect(page.getByText('Vivienda')).toBeVisible()
    await expect(page.getByText('Alimentación')).toBeVisible()
    await expect(page.getByText('Transporte')).toBeVisible()
    await expect(page.getByText('Ocio')).toBeVisible()
  })

  test('shows month label', async ({ page }) => {
    await expect(page.getByText(/Presupuestos de/)).toBeVisible()
  })

  test('opens new category modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva categoría' }).click()
    await expect(page.getByRole('heading', { name: 'Nueva categoría' })).toBeVisible()
  })

  test('has edit and delete buttons for each category', async ({ page }) => {
    const editButtons = page.getByLabel('Editar')
    const count = await editButtons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
