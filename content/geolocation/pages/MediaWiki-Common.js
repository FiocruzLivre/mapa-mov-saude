// No Page Forms, o mapa pode ser inicializado antes de o campo opcional ficar visível.
// A janela de mapas do Leaflet deve ser redimensionada depois de mostrar o campo.
$( function () {
    const canvas = document.querySelector( '#local-de-atuacao .pfMapCanvas' );
    if ( !canvas || typeof ResizeObserver === 'undefined' ) {
        return;
    }
    new ResizeObserver( () => {
        if ( canvas.offsetWidth > 0 && canvas.offsetHeight > 0 ) {
            window.dispatchEvent( new Event( 'resize' ) );
        }
    } ).observe( canvas );
} );
