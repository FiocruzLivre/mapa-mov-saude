# Mapa Colaborativo dos Movimentos Sociais em Saúde

Configurações e dependências do MediaWiki usadas em [mapamovsaude.net.br](https://mapamovsaude.net.br/).

## Estrutura

- `mediawiki/LocalSettings.php`: configuração do site e das extensões.
- `mediawiki/themes/`: estilos do tema.
- `dependencies/`: dependências Composer e ajustes necessários.
- `test/`: testes de configuração e compatibilidade.

O ambiente Docker genérico de desenvolvimento fica em [mediawiki-development](https://github.com/FiocruzLivre/mediawiki-development). O código de geolocalização pertence à extensão [ArticleGeolocation](https://github.com/FiocruzLivre/mediawiki-extension-article-geolocation).

## Verificação

Execute no checkout deste repositório:

```sh
bats --recursive test
```

Para instalar ou atualizar dependências, siga [dependencies/README.md](dependencies/README.md) e valide o resultado em homologação. Não execute `composer update` diretamente na produção.
