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
  await expect(page.getByText('Escreva ou edite o texto abaixo.', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Localização', exact: true })).toBeVisible()
  const richEditor = page.locator('.ve-ce-documentNode').first()
  await expect(richEditor).toBeVisible({ timeout: 20000 })
  await expect(page.locator('.oo-ui-toolbar').first()).toBeVisible()
  await expect(richEditor).toHaveCSS('min-height', '300px')
  await expect(page.getByRole('heading', { name: 'Concluir', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar história' })).toBeVisible()
  await expect(page.getByText('Resumo da edição:')).toHaveCount(0)
  await expect(page.locator('#pfForm fieldset')).toHaveCount(0)
  await expect(page.locator('.ve-ce-paragraphNode').first()).toBeVisible()
  // A edição de texto precisa ser visual, não apenas uma caixa de wikitexto.
  await expect(page.locator('.ve-ce-documentNode').first()).toHaveAttribute('contenteditable', 'true')
  await expect(page.locator('textarea.visualeditor')).toBeHidden()
  const optIn = page.locator('.pf-checkbox-input-container input[type="checkbox"]').first()
  await expect(optIn).not.toBeChecked()
  await expect(page.locator('#local-de-atuacao')).toBeHidden()
  await expect(page.locator('#pfForm .pfMapCanvas')).toBeHidden()
  await expect(page.getByText('Adicionar uma localização a esta história (opcional).')).toBeVisible()
  // Capture somente o conteúdo real da página; o cabeçalho do ambiente de teste não é parte do formulário.
  await page.locator('main').screenshot({ path: test.info().outputPath('local-opcional-fechado.png') })

  await optIn.check()
  await expect(page.locator('#local-de-atuacao')).toBeVisible()
  // Page Forms exibe o bloco em duas animações; a captura não pode ocorrer com opacidade zero.
  await expect(page.locator('#local-de-atuacao')).toHaveCSS('opacity', '1')
  await expect(page.getByText('Procure um bairro ou município', { exact: false })).toBeVisible()
  const address = page.getByPlaceholder('Digite o endereço aqui')
  await expect(address).toBeVisible()
  await expect(page.getByText('Buscar no mapa', { exact: true })).toBeVisible()
  await expect(page.getByText('Calcular coordenadas utilizando o endereço')).toHaveCount(0)
  await address.click()
  await address.fill('Rio de Janeiro')
  await expect(address).toHaveValue('Rio de Janeiro')
  await address.clear()
  const technicalInput = page.locator('#local-de-atuacao input.pfCoordsInput')
  const advanced = page.locator('#local-de-atuacao details.mapamov-location-advanced')
  await expect(advanced.locator('summary')).toHaveText('Ajustar o ponto manualmente (avançado)')
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

  // Clique em terra no interior do Brasil, não no oceano Atlântico.
  await map.click({ position: { x: 295, y: 142 } })
  await expect(technicalInput).not.toHaveValue('')
  const [latitude, longitude] = (await technicalInput.inputValue()).split(/[,;]/).map(Number)
  expect(latitude, 'A latitude deve estar dentro do Brasil').toBeGreaterThan(-35)
  expect(latitude).toBeLessThan(6)
  expect(longitude, 'A longitude deve estar dentro do Brasil').toBeGreaterThan(-75)
  expect(longitude).toBeLessThan(-34)
  await expect(page.getByText('Ponto selecionado. Para mudar, clique no mapa ou arraste o marcador.')).toBeVisible()
  await expect(technicalInput).toBeHidden()
  // Captura real de Brasília com enquadramento aproximado usando o Page Forms.
  await advanced.locator('summary').click()
  await technicalInput.fill('-15.793889, -47.882778')
  await technicalInput.press('Enter')
  await expect.poll(async () => technicalInput.inputValue()).toContain('-15.793889')
  await advanced.locator('summary').click()
  await expect(technicalInput).toBeHidden()
  await expect(page.locator('#local-de-atuacao .leaflet-marker-icon').first()).toBeVisible()
  await expect.poll(async () => page.locator('#local-de-atuacao .leaflet-tile-loaded').count()).toBeGreaterThan(2)
  await page.locator('main').screenshot({ path: test.info().outputPath('local-opcional-selecionado.png') })
  await optIn.uncheck()
  await expect(page.locator('#local-de-atuacao')).toBeHidden()
  await optIn.check()
  await expect(page.locator('#local-de-atuacao')).toBeVisible()
  await advanced.locator('summary').click()
  await expect(technicalInput).toBeVisible()
  await expect(technicalInput).not.toHaveValue('')
  await advanced.locator('summary').click()

  // O usuário escreve no editor rico, sem digitar wikitexto.
  const paragraph = richEditor.locator('.ve-ce-paragraphNode').filter({
    hasText: 'História preservada no formulário.',
  }).first()
  await paragraph.click()
  await richEditor.focus()
  await expect(page.locator('#pf_free_text')).toHaveClass(/ve-for-all-waiting-for-update/)
  await page.keyboard.press('End')
  await page.keyboard.insertText(' História escrita com editor visual.')
  await expect(richEditor).toContainText('História escrita com editor visual.')
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
