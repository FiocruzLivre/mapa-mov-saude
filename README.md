# Mapa Colaborativo dos Movimentos Sociais em Saúde

Configurações e dependências do MediaWiki usadas em [mapamovsaude.net.br](https://mapamovsaude.net.br/).

## Estrutura

- `mediawiki/LocalSettings.php`: configuração do site e das extensões.
- `mediawiki/themes/`: estilos do tema.
- `dependencies/`: dependências Composer e ajustes necessários.
- `test/`: testes de configuração e compatibilidade.

A imagem e o Compose compartilhados para desenvolvimento **e produção** ficam em [mediawiki-development](https://github.com/FiocruzLivre/mediawiki-development). Para uma nova instalação, monte o diretório `mediawiki/` deste repositório em `/var/www/src/mediawiki` por volume ou clone o repositório em `volumes/src` do ambiente compartilhado. Configure banco, proxy e segredos no `.env` e no `docker-compose.override.yml` não versionados daquele ambiente, sem modificar o Compose principal.

A geolocalização opcional pertence à extensão independente [ArticleGeolocation](https://github.com/FiocruzLivre/mediawiki-extension-article-geolocation).

## Verificação

Execute no checkout deste repositório:

```sh
bats --recursive test
```

Para instalar ou atualizar dependências, siga [dependencies/README.md](dependencies/README.md) e valide o resultado em homologação. Não execute `composer update` diretamente na produção.
