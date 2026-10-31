# Formulários de geolocalização

Fontes de páginas MediaWiki para Page Forms 6.0.11, GeoData e Scribunto.

| Arquivo | Página |
| --- | --- |
| pages/Module-Geolocalizacao_do_artigo.wiki | Módulo:Geolocalizacao do artigo |
| pages/Template-Geolocalizacao_do_artigo.wiki | Predefinição:Geolocalização do artigo |
| pages/Template-Geolocalizacao_do_artigo-doc.wiki | Predefinição:Geolocalização do artigo/doc |
| pages/Form-Artigo_com_geolocalizacao.wiki | Form:Artigo com geolocalização (namespace canônico; consultar aliases) |

## Implantação reproduzível, apenas em wiki isolada
1. Criar ambiente e banco descartáveis independentes do ambiente de homologação compartilhado e produção.
2. Consultar action=query&meta=siteinfo&siprop=namespaces|namespacealiases e confirmar o nome local do namespace Form; verificar GeoData, Page Forms e Scribunto.
3. Criar as quatro páginas na ordem Módulo, predefinição, documentação, formulário, por API autenticada com CSRF, usando o conteúdo UTF-8 dos arquivos. Registrar título, SHA256, usuário e oldrevid/newrevid. Não sobrescrever revisões divergentes.
4. Editar página nova ou existente via Special:FormEdit/Artigo com geolocalização/Título. NÃO configurar formulário default, renomear abas ou alterar LocalSettings.php.
5. Executar a CI com testes de integração PHPUnit/GeoData, além de validar no navegador o Page Forms e o VisualEditor em artigos novos e antigos; conferir preservação de referências, predefinições e categorias.
6. Para atualizar uma página instalada, comparar revisões e diffs, não sobrescrever modificações editoriais e verificar a revogação de coordenadas por API e GeoData.

## Modelo de segurança e limites
Uma localização pública válida com exibir_no_mapa=sim pode gerar um ponto primário em GeoData, mas o autor nunca concede aprovação editorial da home. O agregador deve usar estado editorial separado, protegido de edição por autores. Se não existir tal estado, nenhuma inclusão nova deve ocorrer automaticamente. O GeoData também recebe #coordinates manual de outras predefinições; existência em geo_tags não comprova aprovação. Dados de localização não são verificados contra fontes externas neste pacote.
A edição do formulário precisa provar, em homologação, preservação de predefinições, referências e categorias complexas antes de entrar no fluxo de artigos legados. VisualEditor e código-fonte permanecem disponíveis. Não se requer Cargo ou Semantic MediaWiki.
