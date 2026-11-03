#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
for name in Module-Geolocalizacao_do_artigo Template-Geolocalizacao_do_artigo Form-Artigo_com_geolocalizacao Template-Geolocalizacao_do_artigo-doc; do
 test -s "$root/pages/$name.wiki"
done
test -s "$root/pages/MediaWiki-Common.js"
grep -Fq 'ResizeObserver' "$root/pages/MediaWiki-Common.js"
grep -Fq '{{#coordinates:' "$root/pages/Module-Geolocalizacao_do_artigo.wiki"
grep -Fq '|primary}}' "$root/pages/Module-Geolocalizacao_do_artigo.wiki"
grep -Fq '<templatedata>' "$root/pages/Template-Geolocalizacao_do_artigo.wiki"
grep -Fq 'Ponto no mapa (use Editar localização)' "$root/pages/Template-Geolocalizacao_do_artigo.wiki"
grep -Fq 'Usar o campo localizacao e o editor visual de mapa' "$root/pages/Template-Geolocalizacao_do_artigo.wiki"
grep -Fq 'standard input|free text' "$root/pages/Form-Artigo_com_geolocalizacao.wiki"
grep -Fq 'maximum instances=1' "$root/pages/Form-Artigo_com_geolocalizacao.wiki"
grep -Fq 'input type=checkbox|show on select=local-de-atuacao' "$root/pages/Form-Artigo_com_geolocalizacao.wiki"
grep -Fq 'field|localizacao|input type=leaflet' "$root/pages/Form-Artigo_com_geolocalizacao.wiki"
for field in localizacao exibir_no_mapa; do
 grep -Fq "field|$field|" "$root/pages/Form-Artigo_com_geolocalizacao.wiki"
 grep -Fq "|$field=" "$root/pages/Template-Geolocalizacao_do_artigo.wiki"
done
settings="$root/../../mediawiki/LocalSettings.php"
grep -Fq "WG_MAPAMOV_GEOLOCATION_ENABLED" "$settings"
grep -Fq "wfLoadExtension( 'VisualEditor' );" "$settings"
grep -Fq "if ( \$wgMapamovGeolocationEnabled )" "$settings"
echo "Static checks passed"
