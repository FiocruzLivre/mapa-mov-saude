# Local de atuação (opcional)

O MapaMovSaúde chama os conteúdos de **histórias**, sobre movimentos sociais e suas ações. Escrever uma história não exige informar localização.

Ao editar uma história, a pessoa pode marcar “Quero mostrar no mapa da página inicial onde este movimento ou ação atua” e escolher um ponto em um mapa Leaflet, buscando município, bairro ou CEP. Não é preciso informar latitude ou longitude.

A localização registrada na história é pública. A inclusão do PIN no mapa da página inicial depende de aprovação editorial, que pertence à extensão [ArticleGeolocation](https://github.com/FiocruzLivre/mediawiki-extension-article-geolocation). Sem pedido explícito, o formulário não registra um ponto no GeoData.

## Páginas do MediaWiki

| Arquivo | Página |
| --- | --- |
| pages/Module-Geolocalizacao_do_artigo.wiki | Módulo:Geolocalizacao do artigo |
| pages/Template-Geolocalizacao_do_artigo.wiki | Predefinição:Geolocalização do artigo |
| pages/Template-Geolocalizacao_do_artigo-doc.wiki | Predefinição:Geolocalização do artigo/doc |
| pages/Form-Artigo_com_geolocalizacao.wiki | Form:Artigo com geolocalização |
| pages/MediaWiki-Common.js | MediaWiki:Common.js (ajusta o Leaflet quando o campo opcional é aberto) |

Para homologar, instalar as páginas em uma wiki descartável com Page Forms, GeoData e Scribunto; testar criação, edição, remoção de ponto e preservação do conteúdo da história. Não alterar artigos reais automaticamente.

O campo Leaflet grava localizacao como “latitude, longitude”. O módulo Lua mantém leitura das antigas chaves latitude e longitude apenas por compatibilidade. A publicação no mapa principal é uma decisão separada, não uma propriedade do GeoData.
