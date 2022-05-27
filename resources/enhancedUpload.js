$( function () {
	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#enhancedUpload-container' ).append(
		new enhancedUpload.ui.UploadWidget().$element
	);
	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#enhancedUpload-container' ).addClass( 'enhancedUpload-widget' );
} );
