#!/usr/bin/env bats

setup() {
  project="$BATS_TEST_DIRNAME/.."
  conf="$project/mediawiki/apache/short-urls.conf"
  settings="$project/mediawiki/LocalSettings.php"
}

@test "MediaWiki creates root URLs for articles" {
  run grep -F '/$1' "$settings"
  [ "$status" -eq 0 ]
  run grep -F '$wgScriptPath = "";' "$settings"
  [ "$status" -eq 0 ]
}

@test "Apache keeps entry points and resource paths outside article rewrites" {
  run grep -F 'LoadModule rewrite_module' "$conf"
  [ "$status" -eq 0 ]
  run grep -F 'RewriteRule ^(index|api|load|rest|img_auth|thumb|thumb_handler|opensearch_desc)' "$conf"
  [ "$status" -eq 0 ]
  run grep -F 'RewriteRule ^(images|resources|extensions|skins|vendor|cache' "$conf"
  [ "$status" -eq 0 ]
  run grep -F 'RewriteRule ^.+$ /index.php [END]' "$conf"
  [ "$status" -eq 0 ]
}

@test "Legacy article redirects exclude POST and query strings" {
  run grep -F 'RewriteCond %{REQUEST_METHOD} ^(GET|HEAD)$' "$conf"
  [ "$status" -eq 0 ]
  run grep -F 'RewriteCond %{QUERY_STRING} ^$' "$conf"
  [ "$status" -eq 0 ]
  run grep -F 'RewriteCond %{REQUEST_URI} !^/index\.php/' "$conf"
  [ "$status" -eq 0 ]
  run grep -F 'RewriteRule ^index\.php/(.+)$ /$1' "$conf"
  [ "$status" -eq 0 ]
  run grep -F '[R=301,L,NE]' "$conf"
  [ "$status" -eq 0 ]
}
