import { test, expect } from '@playwright/test'

test('formulário real de geolocalização permanece atualizado no README', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )

  await expect(page.getByText('Localização geográfica (opcional)')).toBeVisible()
  await expect(page.getByText('Latitude', { exact: true })).toBeVisible()
  await expect(page.getByText('Longitude', { exact: true })).toBeVisible()

  await page.locator('input[name*="latitude"]').first().fill('-3.68274')
  await page.locator('input[name*="longitude"]').first().fill('-40.3512')

  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page.locator('fieldset').filter({ hasText: 'Latitude' }).first())
    .toHaveScreenshot('formulario-geolocalizacao.png')
})
