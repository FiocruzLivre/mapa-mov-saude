# Mapa Colaborativo dos Movimentos Sociais em Saúde

This repository is the **site-specific** MediaWiki application configuration and
versioned wiki content for https://mapamovsaude.net.br.

## Responsibilities
- `mediawiki/LocalSettings.php`: site identity, enabled extensions, cache and themes.
- `dependencies/`: site-specific Composer manifest, patches and tests.
- `mediawiki/themes/`: Mapa-specific styles and assets.
- Versioned wiki page sources, forms, documentation and site migrations.

**Not this repository:** MediaWiki core, reusable development Docker images,
WikiFavelas settings, or custom executable extension services. The separate
`mediawiki-development` project owns generic local setup. The proposed
`mediawiki-extension-article-geolocation` repository will own the executable
Page Forms integration, GeoData validation, moderation and feed jobs.

## Split and production continuity
This main branch is a direct rename of the historical
`FiocruzLivre/mediawiki-settings:saude` branch at commit
`3048fa44dd771e28e03cfe7ed245de8ac7b3de54`.
Git tree equality with the production checkout commit
`64dff4b9ac09d5a73b1967207b0e45c17428edb8` was verified on 2026-10-30.
The existing MariaDB and uploaded images remain on the production server;
this repository does not contain backup data or secrets.

Do **not** change production merely by selecting the new branch. Validate the
same tree and effective Docker Compose first; repoint Git remote without running
Composer, schema migrations or reloading containers. Maintain the existing
backup cron and operational rollback procedure.

`content/geolocation` (port of the Page Forms source) and
`tools/legacy-map-migration` (82-marker audit) exist only on independent
candidate branches pending tests and review.
