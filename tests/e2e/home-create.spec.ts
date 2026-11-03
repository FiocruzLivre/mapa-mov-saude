import { test, expect } from '@playwright/test'

test('homepage participation entry reaches the visual story form', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto('http://127.0.0.1:8765/index.php?title=Predefinição:Bloco_Como_participar')
  const create = page.getByRole('link', { name: 'Escrever sua história' })
  await expect(create).toBeVisible()
  await create.click()
  await expect(page.getByRole('heading', { name: 'Sua história', exact: true })).toBeVisible()
  await expect(page.locator('.ve-ce-documentNode[contenteditable="true"]').first()).toBeVisible()
})
