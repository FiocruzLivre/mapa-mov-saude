import { test, expect } from '@playwright/test'

test('localização é opcional e a pessoa escolhe o ponto sem digitar coordenadas', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )

  await expect(page.getByRole('heading', { name: 'Local de atuação (opcional)' })).toBeVisible()
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

  // Contrato do editor: o texto livre da história não pode desaparecer ao salvar a localização.
  const content = '== Trajetória ==\nHistória preservada no formulário.\n[[Categoria:Saúde]]'
  await page.locator('textarea[name*="free_text"]').first().fill(content)
  await page.locator('#wpSave').click()

  const response = await page.request.get(
    'http://127.0.0.1:8765/api.php?action=query&prop=revisions&rvslots=main&rvprop=content&formatversion=2&titles=Artigo_de_exemplo&format=json',
  )
  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  const wikiText = data.query.pages[0].revisions[0].slots.main.content as string
  expect(wikiText).toContain('História preservada no formulário.')
  expect(wikiText).toContain('[[Categoria:Saúde]]')
  expect(wikiText).toContain('localizacao=')
})
