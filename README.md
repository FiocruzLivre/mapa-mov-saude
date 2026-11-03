# Mapa Colaborativo dos Movimentos Sociais em Saúde

Configurações e dependências do MediaWiki usadas em [mapamovsaude.net.br](https://mapamovsaude.net.br/).

## Estrutura

- `mediawiki/LocalSettings.php`: configuração do site e das extensões.
- `mediawiki/themes/`: estilos do tema.
- `dependencies/`: dependências Composer e ajustes necessários.
- `test/`: testes de configuração e compatibilidade.

A imagem reutilizável do MediaWiki e o Compose base ficam em [mediawiki-development](https://github.com/FiocruzLivre/mediawiki-development). Para uma nova instalação, monte o diretório `mediawiki/` deste repositório em `/var/www/src/mediawiki` por volume ou clone o repositório em `volumes/src` do ambiente compartilhado. Configure banco, proxy e segredos no `.env` e no `docker-compose.override.yml` não versionados daquele ambiente, sem modificar o Compose principal.

A geolocalização opcional pertence à extensão independente [ArticleGeolocation](https://github.com/FiocruzLivre/mediawiki-extension-article-geolocation).

## URLs de artigos

O Mapa publica artigos em URLs curtas na raiz do domínio (\`/$1\`). A implantação
deve montar [mediawiki/apache/short-urls.conf](mediawiki/apache/short-urls.conf)
em \`/etc/apache2/conf-enabled/mapamov-short-urls.conf:ro\` **somente no serviço
deste site**. O arquivo ativa \`mod_rewrite\` na instalação Apache existente,
preserva as rotas de API e recursos, e mantém os links legados de leitura.
URLs antigas com parâmetros ou métodos diferentes de GET/HEAD não são redirecionadas.

## Verificação

Execute no checkout deste repositório:

```sh
bats --recursive test
```

Para instalar ou atualizar dependências, siga [dependencies/README.md](dependencies/README.md) e valide o resultado em homologação. Não execute `composer update` diretamente na produção.

## Layout responsivo da página inicial

O CSS `mediawiki/themes/home-responsive.css` é carregado apenas na página principal.
A correção do espaçamento do boletim exige publicar também a revisão de
`content/home/pages/Template-Bloco_Boletim_digital.wiki` na página MediaWiki
`Predefinição:Bloco Boletim digital`, preservando seu histórico de alterações.
