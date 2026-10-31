<?php
declare( strict_types=1 );

use GeoData\GeoData;
use MediaWiki\Title\Title;

/**
 * Executado em banco descartável MediaWiki com Scribunto e GeoData ativos.
 * @coversNothing
 * @group Database
 */
class GeolocalizacaoFormularioTest extends MediaWikiIntegrationTestCase {
    protected function setUp(): void {
        parent::setUp();
        $root = dirname( __DIR__, 3 ) . '/content/geolocation/pages/';
        foreach ( [
            'Module:Geolocalizacao do artigo' => 'Module-Geolocalizacao_do_artigo.wiki',
            'Template:Geolocalização do artigo' => 'Template-Geolocalizacao_do_artigo.wiki',
        ] as $titleText => $file ) {
            $title = Title::newFromText( $titleText );
            $this->assertNotNull( $title );
            $page = $this->getServiceContainer()->getWikiPageFactory()->newFromTitle( $title );
            $this->editPage( $page, file_get_contents( $root . $file ) );
        }
        $this->runJobs();
    }

    /** @dataProvider validCoordinates */
    public function testPublishesOnlyExplicitValidCoordinates(
        string $latitude, string $longitude, string $request, bool $expected
    ): void {
        $page = $this->getNonexistingTestPage();
        $wikitext = '{{Geolocalização do artigo|latitude=' . $latitude .
            '|longitude=' . $longitude .
            '|precisao=municipio|tipo_local=atuacao|exibir_no_mapa=' . $request . '}}';
        $this->editPage( $page, $wikitext );
        $this->runJobs();
        $coords = GeoData::getAllCoordinates( $page->getId(), [ 'gt_primary' => 1 ], DB_PRIMARY );
        $this->assertCount( $expected ? 1 : 0, $coords );
        if ( $expected ) {
            $this->assertSame( (float)$latitude, $coords[0]->lat );
            $this->assertSame( (float)$longitude, $coords[0]->lon );
        }
    }

    public static function validCoordinates(): iterable {
        yield 'sem publicação' => [ '-3.68274', '-40.3512', 'nao', false ];
        yield 'ponto publicado' => [ '-3.68274', '-40.3512', 'sim', true ];
        yield 'linha do equador' => [ '0', '0', 'sim', true ];
        yield 'latitude inválida' => [ '91', '0', 'sim', false ];
        yield 'longitude inválida' => [ '0', '181', 'sim', false ];
        yield 'notação científica rejeitada' => [ '1e2', '0', 'sim', false ];
        yield 'vírgula rejeitada' => [ '1,2', '2', 'sim', false ];
        yield 'casa decimal excessiva' => [ '1.1234567890123', '2', 'sim', false ];
        yield 'coordenada ausente' => [ '', '-40', 'sim', false ];
    }

    /** @dataProvider invalidClassifications */
    public function testInvalidClassificationDoesNotCreatePrimaryCoordinate(
        string $precision, string $kind
    ): void {
        $page = $this->getNonexistingTestPage();
        $markup = '{{Geolocalização do artigo|latitude=-3.68274|longitude=-40.3512'
            . '|precisao=' . $precision . '|tipo_local=' . $kind
            . '|exibir_no_mapa=sim}}';
        $this->editPage( $page, $markup );
        $this->runJobs();
        $this->assertSame(
            [],
            GeoData::getAllCoordinates( $page->getId(), [ 'gt_primary' => 1 ], DB_PRIMARY )
        );
    }

    public static function invalidClassifications(): iterable {
        yield 'precisão desconhecida' => [ 'endereco_privado', 'atuacao' ];
        yield 'tipo desconhecido' => [ 'municipio', 'endereco_privado' ];
        yield 'precisão vazia' => [ '', 'atuacao' ];
        yield 'tipo vazio' => [ 'municipio', '' ];
    }

    public function testRemovalOfGeolocationRemovesGeoDataCoordinates(): void {
        $page = $this->getNonexistingTestPage();
        $first = '{{Geolocalização do artigo|latitude=-3.68274|longitude=-40.3512'
            . '|precisao=municipio|tipo_local=atuacao|exibir_no_mapa=sim}}';
        $this->editPage( $page, $first );
        $this->runJobs();
        $this->assertCount( 1, GeoData::getAllCoordinates( $page->getId(), [], DB_PRIMARY ) );

        $this->editPage( $page, str_replace( 'exibir_no_mapa=sim', 'exibir_no_mapa=nao', $first ) );
        $this->runJobs();
        $this->assertSame( [], GeoData::getAllCoordinates( $page->getId(), [], DB_PRIMARY ) );
    }

    public function testSourceEditingKeepsUnrelatedWikitextWhenLocationChanges(): void {
        $page = $this->getNonexistingTestPage();
        $text = "== Conteúdo ==\nReferência e [[Categoria:Saúde coletiva]]\n";
        $location = '{{Geolocalização do artigo|latitude=-3|longitude=-40'
            . '|precisao=municipio|tipo_local=atuacao|exibir_no_mapa=sim}}';
        $this->editPage( $page, $text . $location );
        $this->runJobs();
        $this->editPage( $page, $text . str_replace( '-3|longitude', '-4|longitude', $location ) );
        $this->runJobs();
        $this->assertStringContainsString( $text, $page->getContent()->getText() );
        $coord = GeoData::getPageCoordinates( $page->getId() );
        $this->assertSame( -4.0, $coord->lat );
    }
}
