# Dependências do MediaWiki — Mapa MovSaúde

O `composer.json` deste diretório fornece as dependências específicas do site. O script `prepare-composer.sh` prepara sua integração ao Composer do MediaWiki em um ambiente de montagem ou homologação.

## Ajustes de dependências

Dois patches identificados e verificados por SHA-256 em `patches.json` são necessários nas versões atuais:

- **BootstrapComponents 6.1.1:** evita acessar `Parser::getOutput()` sem `ParserOutput` inicializado durante a conversão Parsoid/REST. [Problema upstream](https://github.com/oetterer/BootstrapComponents/issues/51).
- **HitCounters 0.4:** corrige o prefixo PSR-4 para o namespace `HitCounters\\`.

O Composer Patches v2 exige configuração no projeto Composer raiz; o `composer.local.json` isoladamente não basta.

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
