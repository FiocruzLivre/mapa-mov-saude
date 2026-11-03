#!/usr/bin/env bats

setup() {
  project="$BATS_TEST_DIRNAME/.."
  settings="$project/mediawiki/LocalSettings.php"
  form="$project/content/geolocation/pages/Form-Artigo_com_geolocalizacao.wiki"
  manifest="$project/dependencies/composer.json"
}

@test "Gated VEForAll is available for rich story creation" {
  run grep -F "wfLoadExtension( 'Echo' );" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "wfLoadExtension( 'VEForAll' );" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "getenv( 'WG_MAPAMOV_GEOLOCATION_ENABLED' ) === false" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "getenv( 'WG_MAPAMOV_EDITORIAL_MODERATION_ENABLED' ) === false" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "wfLoadExtension( 'Moderation' );" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "NS_MAIN, NS_FILE" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "['reviewer']['moderation'] = true;" "$settings"
  [ "$status" -eq 0 ]
  run jq -e '.require["mediawiki/moderation"] == "1.9.8" and
    .require["mediawiki/ve-for-all"] == "0.8.1" and
    any(.repositories[]?; .package.name? == "mediawiki/ve-for-all" and
      .package.source.reference == "e78bcde46752b598186dc0921454c205dd6aea54")' "$manifest"
  [ "$status" -eq 0 ]
}

@test "Reviewers can approve and verified moderators receive review emails by default" {
  run grep -F '$wgGroupPermissions[' "$settings"
  [ "$status" -eq 0 ]
  run grep -F "['reviewer']['articlegeolocation-review'] = true;" "$settings"
  [ "$status" -eq 0 ]
  run grep -F "'echo-subscriptions-email-article-geolocation'] = true;" "$settings"
  [ "$status" -eq 0 ]
}

@test "Story form includes visual text, optional map request, and save controls" {
  run grep -F 'editor=visualeditor' "$form"
  [ "$status" -eq 0 ]
  run grep -F 'field|exibir_no_mapa' "$form"
  [ "$status" -eq 0 ]
  run grep -F 'field|localizacao|input type=leaflet' "$form"
  [ "$status" -eq 0 ]
  run grep -F 'standard input|save' "$form"
  [ "$status" -eq 0 ]
}
