#!/usr/bin/env bash
set -Eeuo pipefail

wiki="${MEDIAWIKI_ROOT:?A wiki deve ser descartável}"
pages="$(cd "$(dirname "$0")/../../content/geolocation/pages" && pwd)"

cd "$wiki"
php maintenance/run.php edit --user editor_teste 'Module:Geolocalizacao do artigo' \
    < "$pages/Module-Geolocalizacao_do_artigo.wiki"
php maintenance/run.php edit --user editor_teste 'Template:Geolocalização do artigo' \
    < "$pages/Template-Geolocalizacao_do_artigo.wiki"
php maintenance/run.php edit --user editor_teste 'Form:Artigo com geolocalização' \
    < "$pages/Form-Artigo_com_geolocalizacao.wiki"
php maintenance/run.php edit --user editor_teste 'MediaWiki:Common.js' \
    < "$pages/MediaWiki-Common.js"

# História existente para testar edição visual sem perder formatação ou categorias.
php maintenance/run.php edit --user editor_teste 'Artigo de exemplo' <<'WIKITEXT'
== Trajetória ==
História preservada no formulário.
[[Categoria:Saúde]]
{{Geolocalização do artigo|exibir_no_mapa=|localizacao=}}
WIKITEXT
