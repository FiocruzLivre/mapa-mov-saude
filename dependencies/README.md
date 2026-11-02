# Dependências do MediaWiki — Mapa MovSaúde

Este diretório reúne as dependências e os ajustes específicos do MapaMovSaúde. Prepare e teste as alterações em homologação antes de implantá-las.

## Ajustes de dependências

Os patches listados em `patches.json` corrigem dois problemas de compatibilidade:

- **BootstrapComponents:** corrige a integração com VisualEditor/REST. [Problema upstream](https://github.com/oetterer/BootstrapComponents/issues/51).
- **HitCounters:** corrige o carregamento de classes.

## Instalação em homologação

Com o MediaWiki e as extensões já preparados:

```sh
sh dependencies/prepare-composer.sh /caminho/do/mediawiki
cd /caminho/do/mediawiki
composer update cweagans/composer-patches --minimal-changes --with-all-dependencies --no-dev --no-interaction
composer patches-relock --no-interaction
composer patches-repatch --no-interaction
composer dump-autoload --optimize --no-interaction
composer audit --locked --no-dev --no-interaction
```

Valide o resultado com `bats --recursive test` na raiz deste repositório e teste VisualEditor/REST nas páginas que usam BootstrapComponents. Versione o `composer.lock` e `patches.lock.json` correspondentes ao release testado. A produção deve receber esse conjunto pronto, sem resolver dependências novamente.
