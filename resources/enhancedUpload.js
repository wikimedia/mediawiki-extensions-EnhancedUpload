$( function () {
	var singleUpload = false;
	var destFilename = '';
	if ( mw.util.getParamValue( 'wpDestFile' ) ) {
		if ( mw.util.getParamValue( 'wpForReUpload' ) === '1' ) {
			singleUpload = true;
			destFilename = mw.util.getParamValue( 'wpDestFile' );
		}
	}

	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#enhancedUpload-container' ).append(
		new enhancedUpload.ui.UploadWidget( {
			singleUpload: singleUpload,
			destFilename: destFilename
		} ).$element
	);

	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#enhancedUpload-container' ).addClass( 'enhancedUpload-widget' );
} );
