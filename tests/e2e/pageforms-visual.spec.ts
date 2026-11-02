import { test, expect } from '@playwright/test'

test('localização é opcional e a pessoa escolhe o ponto sem digitar coordenadas', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )

  await expect(page.getByText('Local de atuação (opcional)')).toBeVisible()
  const optIn = page.locator('.pf-checkbox-input-container input[type="checkbox"]').first()
  await expect(optIn).not.toBeChecked()
  await expect(page.locator('#local-de-atuacao')).toBeHidden()

  await optIn.check()
  await expect(page.locator('#local-de-atuacao')).toBeVisible()
  const map = page.locator('#local-de-atuacao .pfMapCanvas')
  await expect(map).toBeVisible()
  await expect(page.locator('#local-de-atuacao .leaflet-tile-pane')).toBeAttached()

  await map.click({ position: { x: 170, y: 110 } })
  await expect(page.locator('#local-de-atuacao input.pfCoordsInput')).not.toHaveValue('')
})
