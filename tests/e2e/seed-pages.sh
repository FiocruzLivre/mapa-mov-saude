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
