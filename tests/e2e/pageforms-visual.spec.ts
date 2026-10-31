import { test, expect } from '@playwright/test'

test('formulário real de geolocalização permanece atualizado no README', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )

  await expect(page.locator('h1').filter({ hasText: 'Localização geográfica (opcional)' }).first()).toBeVisible()
  await expect(page.getByText('Latitude', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Longitude', { exact: true }).first()).toBeVisible()

  await page.locator('input[name*="latitude"]').first().fill('-3.68274')
  await page.locator('input[name*="longitude"]').first().fill('-40.3512')
  await page.locator('select[name*="precisao"]').first().selectOption('municipio')
  await page.locator('select[name*="tipo_local"]').first().selectOption('atuacao')
  await page.locator('select[name*="exibir_no_mapa"]').first().selectOption('sim')

  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page.locator('fieldset').filter({ hasText: 'Latitude' }).first())
    .toHaveScreenshot('formulario-geolocalizacao.png')
})
