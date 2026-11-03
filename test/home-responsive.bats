#!/usr/bin/env bats

setup() {
  root="$BATS_TEST_DIRNAME/.."
  css="$root/mediawiki/themes/home-responsive.css"
  settings="$root/mediawiki/LocalSettings.php"
  bulletin="$root/content/home/pages/Template-Bloco_Boletim_digital.wiki"
}

@test "Responsive CSS is loaded only on the MediaWiki main page" {
  run grep -F 'ext.mapamov.homeResponsive' "$settings"
  [ "$status" -eq 0 ]
  run grep -F '$out->getTitle()->isMainPage()' "$settings"
  [ "$status" -eq 0 ]
  run grep -F "'styles' => [ 'themes/home-responsive.css' ]" "$settings"
  [ "$status" -eq 0 ]
  [ -s "$css" ]
}

@test "Hero keeps image and search contained and adjusts spacing on mobile" {
  run grep -F '#principal figure img' "$css"
  [ "$status" -eq 0 ]
  run grep -F '#principal.p-5' "$css"
  [ "$status" -eq 0 ]
  run grep -F '#principal .mw-inputbox-form-inline input[type="search"]' "$css"
  [ "$status" -eq 0 ]
}

@test "Mobile map has a bounded height and home cards use one column" {
  run grep -F '#mapa-interativo .mw-kartographer-map' "$css"
  [ "$status" -eq 0 ]
  run grep -F 'width: 100%;' "$css"
  [ "$status" -eq 0 ]
  run grep -F '.mw-parser-output > .row > [class*="col-"]' "$css"
  [ "$status" -eq 0 ]
}

@test "Newsletter text is inside its card body alongside its button" {
  run awk '
    /<div class="card-body">/ { body = 1 }
    body && /Cadastre-se para receber/ { text = 1 }
    body && /Botão\|/ { button = 1 }
    body && /<\/div>/ { if (text && button) ok = 1; body = 0 }
    END { exit !ok }
  ' "$bulletin"
  [ "$status" -eq 0 ]
}
