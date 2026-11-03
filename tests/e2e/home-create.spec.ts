import { test, expect } from '@playwright/test'

test('homepage participation entry reaches the visual story form', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto('http://127.0.0.1:8765/index.php?title=Predefinição:Bloco_Como_participar')
  const create = page.getByRole('link', { name: 'Escrever sua história' })
  await expect(create).toBeVisible()
  await page.locator('main').screenshot({ path: test.info().outputPath('home-escrever-historia.png') })
  await create.click()
  await expect(page.getByRole('heading', { name: 'Criar Artigo com geolocalização' })).toBeVisible()
  const titleInput = page.locator('input[name="page_name"]')
  await expect(titleInput).toBeVisible()
  await titleInput.fill('História de validação da interface')
  await page.locator('.pfCreateOrEditButton button[type="submit"]').click()
  await expect(page.getByRole('heading', { name: 'Sua história', exact: true })).toBeVisible()
  await expect(page.locator('.ve-ce-documentNode[contenteditable="true"]').first())
    .toBeVisible({ timeout: 20000 })
})
