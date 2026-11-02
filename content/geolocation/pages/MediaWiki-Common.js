// Ajustes do Page Forms, sem modificar a extensão ou os dados da história.
$( function () {
    // O editor visual nativo abre com apenas 130px; espaço real para escrever.
    if ( document.querySelector( '#pfForm #pf_free_text.visualeditor' ) && mw.util && mw.util.addCSS ) {
        mw.util.addCSS( '#pfForm .ve-area-wrapper .ve-ce-documentNode {' +
            'min-height: 300px; box-sizing: border-box; padding: 18px 20px;' +
            '}' );
    }

    const section = document.querySelector( '#local-de-atuacao' );
    const canvas = section && section.querySelector( '.pfMapCanvas' );
    const coordinates = section && section.querySelector( '.pfCoordsInput' );
    if ( !canvas || !coordinates ) {
        return;
    }

    // O Page Forms usa este input para persistir o ponto. Mantê-lo no
    // formulário, mas fora do caminho principal de quem usa o mapa.
    const inputWrapper = coordinates.parentElement;
    const details = document.createElement( 'details' );
    details.className = 'mapamov-location-advanced';
    const summary = document.createElement( 'summary' );
    summary.textContent = 'Ajustar o ponto manualmente (avançado)';
    const explanation = document.createElement( 'p' );
    explanation.textContent = 'Estes números indicam a posição do ponto no mapa. Normalmente não é necessário alterá-los.';
    details.append( summary, explanation, inputWrapper );
    canvas.parentElement.appendChild( details );

    const status = document.createElement( 'p' );
    status.className = 'mapamov-location-status';
    status.setAttribute( 'role', 'status' );
    status.setAttribute( 'aria-live', 'polite' );
    details.before( status );

    const updateStatus = () => {
        status.textContent = coordinates.value.trim() ?
            'Ponto selecionado. Para mudar, clique no mapa ou arraste o marcador.' :
            'Nenhum ponto selecionado. Pesquise um local ou clique no mapa.';
    };
    updateStatus();
    coordinates.addEventListener( 'input', updateStatus );
    coordinates.addEventListener( 'change', updateStatus );

    // Leaflet altera o valor via jQuery.val(), sem disparar input/change.
    // A extensão também atualiza data-original-value em cada movimento.
    new MutationObserver( updateStatus ).observe( coordinates, {
        attributes: true,
        attributeFilter: [ 'data-original-value' ]
    } );

    if ( typeof mw !== 'undefined' && mw.util && mw.util.addCSS ) {
        mw.util.addCSS(
            '#local-de-atuacao .mapamov-location-status {' +
                'margin: 12px 0; padding: 10px 12px;' +
                'border-inline-start: 3px solid #36c; background: #f8f9fa;' +
            '}' +
            '#local-de-atuacao .mapamov-location-advanced {' +
                'margin: 12px 0; font-size: 0.9em;' +
            '}' +
            '#local-de-atuacao .mapamov-location-advanced summary {' +
                'cursor: pointer; width: fit-content;' +
            '}' +
            '#local-de-atuacao .mapamov-location-advanced p {' +
                'margin: 8px 0 0; color: #54595d;' +
            '}' +
            '#local-de-atuacao .mapamov-location-advanced .pfCoordsInput {' +
                'max-width: 100%; box-sizing: border-box;' +
            '}'
        );
    }

    // O campo opcional pode ser mostrado depois que o Leaflet foi iniciado.
    if ( typeof ResizeObserver !== 'undefined' ) {
        new ResizeObserver( () => {
            if ( canvas.offsetWidth > 0 && canvas.offsetHeight > 0 ) {
                window.dispatchEvent( new Event( 'resize' ) );
            }
        } ).observe( canvas );
    }
} );
