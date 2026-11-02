import { test, expect } from '@playwright/test'

test('localização é opcional e a pessoa escolhe o ponto sem digitar coordenadas', async ({ page }) => {
  page.on('pageerror', (error) => console.log('JS pageerror:', error.message))
  page.on('response', async (response) => {
    if (response.url().includes('veforall-parsoid-utils')) {
      console.log('Parsoid response', response.status(), (await response.text()).slice(0, 450))
    }
  })
  page.on('console', (message) => {
    if (message.type() === 'error') console.log('JS console:', message.text())
  })
  await page.goto('http://127.0.0.1:8765/index.php?title=Especial:Entrar')
  await page.locator('#wpName1').fill('editor_teste')
  await page.locator('#wpPassword1').fill('senha_de_teste')
  await page.locator('#wpLoginAttempt').click()

  await page.goto(
    'http://127.0.0.1:8765/index.php?title=Especial:FormEdit/Artigo_com_geolocalização/Artigo_de_exemplo',
  )

  await expect(page.getByRole('heading', { name: 'Localização (opcional)' })).toBeVisible()
  console.log('VisualEditor state', await page.evaluate(() => ({
    textarea: document.querySelector('#pf_free_text')?.className,
    loaded: !!(window as any).jQuery?.fn?.applyVisualEditor,
    module: (window as any).mw?.loader?.getState('ext.veforall.main'),
    editorModule: (window as any).mw?.loader?.getState('ext.visualEditor.core'),
  })))
  const richEditor = page.locator('.ve-ce-documentNode').first()
  try {
    await expect(richEditor).toBeVisible({ timeout: 20000 })
  } catch (error) {
    console.log('VisualEditor modules', await page.evaluate(() => {
      const jq = (window as any).jQuery
      const loader = (window as any).mw?.loader
      const instances = jq?.fn?.getVEInstances ? jq([]).getVEInstances() : []
      return {
        apply: !!jq?.fn?.applyVisualEditor,
        instances: instances.map((instance: any) => ({
          hasTarget: !!instance.target,
          disabled: instance.$node?.prop('disabled'),
        })),
        textarea: document.querySelector('#pf_free_text')?.className,
        status: Object.fromEntries([
          'ext.veforall.main', 'ext.veforall.core', 'ext.veforall.core.desktop',
          'ext.visualEditor.core', 'ext.visualEditor.data',
          'ext.visualEditor.mediawiki', 'ext.visualEditor.mwextensions.desktop',
          'ext.visualEditor.mwimage', 'ext.visualEditor.mwlink',
          'ext.visualEditor.mwtransclusion', 'ext.visualEditor.mwinit',
        ].map((name) => [name, loader?.getState(name)])),
      }
    }))
    throw error
  }
  await expect(page.locator('.oo-ui-toolbar').first()).toBeVisible()
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
  await richEditor.click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.press('Enter')
  await page.keyboard.type('História escrita com editor visual.')
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
