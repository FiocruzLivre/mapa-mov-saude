import { test, expect } from '@playwright/test'

test('localização é opcional e a pessoa escolhe o ponto sem digitar coordenadas', async ({ page }) => {
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )

  await expect(page.getByRole('heading', { name: 'Sua história', exact: true })).toBeVisible()
  await expect(page.getByText('Escreva sua história usando o editor visual abaixo.', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Localização (opcional)' })).toBeVisible()
  const richEditor = page.locator('.ve-ce-documentNode').first()
  await expect(richEditor).toBeVisible({ timeout: 20000 })
  await expect(page.locator('.oo-ui-toolbar').first()).toBeVisible()
  await expect(page.locator('.ve-ce-paragraphNode').first()).toBeVisible()
  // A edição de texto precisa ser visual, não apenas uma caixa de wikitexto.
  await expect(page.locator('.ve-ce-documentNode').first()).toHaveAttribute('contenteditable', 'true')
  await expect(page.locator('textarea.visualeditor')).toBeHidden()
  const optIn = page.locator('.pf-checkbox-input-container input[type="checkbox"]').first()
  await expect(optIn).not.toBeChecked()
  await expect(page.locator('#local-de-atuacao')).toBeHidden()
  await page.screenshot({ path: test.info().outputPath('local-opcional-fechado.png'), fullPage: true })

  await optIn.check()
  await expect(page.locator('#local-de-atuacao')).toBeVisible()
  // Page Forms exibe o bloco em duas animações; a captura não pode ocorrer com opacidade zero.
  await expect(page.locator('#local-de-atuacao')).toHaveCSS('opacity', '1')
  await expect(page.getByText('Busque um município, bairro ou endereço', { exact: false })).toBeVisible()
  const address = page.getByPlaceholder('Digite o endereço aqui')
  await expect(address).toBeVisible()
  await address.click()
  await address.fill('Rio de Janeiro')
  await expect(address).toHaveValue('Rio de Janeiro')
  const technicalInput = page.locator('#local-de-atuacao input.pfCoordsInput')
  const advanced = page.locator('#local-de-atuacao details.mapamov-location-advanced')
  await expect(advanced).toBeVisible()
  await expect(advanced).not.toHaveAttribute('open', '')
  await expect(technicalInput).toBeHidden()
  await expect(page.getByText('Nenhum ponto selecionado. Pesquise um local ou clique no mapa.')).toBeVisible()
  const map = page.locator('#local-de-atuacao .pfMapCanvas')
  await expect(map).toBeVisible()
  await expect(page.locator('#local-de-atuacao .leaflet-tile-pane')).toBeAttached()
  await expect(page.locator('#local-de-atuacao .leaflet-tile-loaded').first()).toBeVisible({ timeout: 15000 })
  await expect.poll(async () => page.locator('#local-de-atuacao .leaflet-tile-loaded').count(), { timeout: 15000 })
    .toBeGreaterThan(2)

  await map.click({ position: { x: 170, y: 110 } })
  await expect(technicalInput).not.toHaveValue('')
  await expect(page.getByText('Ponto selecionado. Para mudar, clique no mapa ou arraste o marcador.')).toBeVisible()
  await expect(technicalInput).toBeHidden()
  await page.screenshot({ path: test.info().outputPath('local-opcional-selecionado.png'), fullPage: true })
  await advanced.locator('summary').click()
  await expect(technicalInput).toBeVisible()
  await expect(technicalInput).not.toHaveValue('')
  await advanced.locator('summary').click()

  // O usuário escreve no editor rico, sem digitar wikitexto.
  const paragraph = richEditor.locator('.ve-ce-paragraphNode').filter({
    hasText: 'História preservada no formulário.',
  }).first()
  await paragraph.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' História escrita com editor visual.', { delay: 80 })
  await expect(richEditor).toContainText('História escrita com editor visual.')
  await expect.poll(async () => page.evaluate(() => {
    const instances = (window as any).jQuery([]).getVEInstances()
    return instances[0].target.getSurface().getHtml().includes('História escrita com editor visual.')
  })).toBe(true)
  const save = page.locator('#wpSave button[type="submit"]')
  await expect(save).toBeEnabled()
  await save.click()

  // O VEForAll converte o conteúdo para wikitexto antes de finalizar o envio.
  const contentUrl =
    'http://127.0.0.1:8765/api.php?action=query&prop=revisions&rvslots=main&rvprop=content&formatversion=2&titles=Artigo_de_exemplo&format=json'
  await expect.poll(async () => {
    const response = await page.request.get(contentUrl)
    if (!response.ok()) return false
    const data = await response.json()
    const text = data.query.pages[0]?.revisions?.[0]?.slots?.main?.content ?? ''
    return text.includes('História escrita com editor visual.')
  }, { timeout: 30000 }).toBe(true)
  const response = await page.request.get(contentUrl)
  const data = await response.json()
  const wikiText = data.query.pages[0].revisions[0].slots.main.content as string
  expect(wikiText).toContain('História preservada no formulário.')
  expect(wikiText).toContain('História escrita com editor visual.')
  expect(wikiText).toContain('[[Categoria:Saúde]]')
  expect(wikiText).toContain('localizacao=')

  // Reabrir a história não pode perder o local nem o texto já publicado.
  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )
  await expect(optIn).toBeChecked()
  await expect(page.locator('#local-de-atuacao input.pfCoordsInput')).not.toHaveValue('')
  await expect(page.locator('.ve-ce-documentNode').first())
    .toContainText('História escrita com editor visual.')
})
