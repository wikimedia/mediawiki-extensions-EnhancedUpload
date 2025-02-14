$( document ).on( 'click', '.enhanced-filelist-upload-file a', ( e ) => {
	e.preventDefault();
	mw.loader.using( [ 'ext.enhancedUpload.upload.dialog' ] ).done( () => {
		var dialog = new enhancedUpload.ui.dialog.UploadFilesDialog();
		dialog.show();
	} );
	return false;
} );

mw.hook( 'enhanced.filelist.action' ).add( function ( data ) {
	if ( data.action === 'reupload' ) {
		data.action = '';
		mw.loader.using( [ 'ext.enhancedUpload.singleupload.dialog' ] ).done( function () {
			var dialog = new enhancedUpload.ui.dialog.UploadSingleFileDialog( {
				destFilename: data.row.dbkey,
				dialogTitle: mw.message( 'enhancedupload-single-file-dlg-title', data.row.dbkey ).text()
			} );
			dialog.show();
		} );
	}
} );
