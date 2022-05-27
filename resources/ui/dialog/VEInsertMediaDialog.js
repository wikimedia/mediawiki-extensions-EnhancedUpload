window.enhancedUpload = window.enhancedUpload || {};
window.enhancedUpload.ui = window.enhancedUpload.ui || {};
window.enhancedUpload.ui.dialog = window.enhancedUpload.ui.dialog || {};

enhancedUpload.ui.dialog.VEInsertMediaDialog = function ( cfg ) {
	enhancedUpload.ui.dialog.VEInsertMediaDialog.super.call( this, cfg );
};

OO.inheritClass( enhancedUpload.ui.dialog.VEInsertMediaDialog, ve.ui.NodeDialog );

enhancedUpload.ui.dialog.VEInsertMediaDialog.static.name = 'mediaUpload';

enhancedUpload.ui.dialog.VEInsertMediaDialog.static.title = OO.ui.deferMsg( 'enhancedupload-ve-dialog-title' );

enhancedUpload.ui.dialog.VEInsertMediaDialog.static.size = 'medium';

/**
 * @inheritdoc
 */
enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.initialize = function () {
	enhancedUpload.ui.dialog.VEInsertMediaDialog.super.prototype.initialize.call( this );
	var panel;
	this.pageName = mw.config.get( 'wgPageName' );

	this.targetTitle = new OO.ui.TextInputWidget( {
		value: this.pageName + '_' + Date.now()
	} );

	this.content = new OO.ui.PanelLayout( {
		padded: true,
		expanded: true
	} );

	panel = new OO.ui.FieldLayout( this.targetTitle, {
		label: mw.message( 'enhancedupload-ve-dialog-filename-label' ).plain(),
		align: 'top'
	} );
	this.content.$element.append( panel.$element );

	this.$body.append( this.content.$element );
};

/**
 * @inheritdoc
 */
enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.getSetupProcess = function ( data ) {
	this.file = data.file;
	this.targetTitle.setValue( this.pageName + '_' + Date.now() );
	return enhancedUpload.ui.dialog.VEInsertMediaDialog.super.prototype.getSetupProcess.call(
		this, data
	);
};

/**
 * @inheritdoc
 */
enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.getBodyHeight = function () {
	// eslint-disable-next-line no-jquery/no-class-state
	if ( !this.$errors.hasClass( 'oo-ui-element-hidden' ) ) {
		return this.$element.find( '.oo-ui-processDialog-errors' )[ 0 ].scrollHeight;
	}

	return this.$element.find( '.oo-ui-window-body' )[ 0 ].scrollHeight + 10;
};

enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.getActionProcess = function ( action ) {
	var me = this, params, dfdUpload, fileName, fileType, fileFormat;
	return enhancedUpload.ui.dialog.VEInsertMediaDialog.super.prototype.getActionProcess.call(
		this, action
	).next( function () {
		if ( action === 'done' ) {
			fileType = me.file.type;
			// eslint-disable-next-line unicorn/prefer-string-slice
			fileFormat = me.file.name.substring( me.file.name.indexOf( '.' ) + 1 );
			fileName = me.targetTitle.getValue() + '.' + fileFormat;

			params = {
				filename: fileName,
				format: fileType,
				ignorewarnings: false
			};

			dfdUpload = this.doUpload( me.file, params );

			dfdUpload.done( function ( resp ) {
				me.insertMedia( fileName, resp.upload.imageinfo.url, me.file );
				me.close( { action: action } );
			} )
				// eslint-disable-next-line no-shadow-restricted-names
				.fail( function ( error, arguments ) {
					me.handleErrors( error, arguments, fileName, me.fragment );
					me.close( { action: action } );
				} );
			me.targetTitle.setValue( '' );
		}
	}, this );

};

enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.doUpload = function ( file, params ) {
	var mwApi = new mw.Api(),
		dfd = new $.Deferred();
	mwApi.upload( file, params ).done( function ( resp ) {
		dfd.resolve( resp );
	} ).fail( function ( error ) {
		dfd.reject( error, arguments );
	} );

	return dfd.promise();
};

enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.insertMedia =
	function ( fileName, url, file, fragment ) {
		var title, annotationTitle, surfaceModel;
		// eslint-disable-next-line no-restricted-syntax
		if ( file.type.includes( 'image' ) ) {
			if ( !fragment ) {
				fragment = this.getFragment();
			}
			title = mw.Title.newFromText( 'File:' + fileName );
			this.imageModel = ve.dm.MWImageModel.static.newFromImageAttributes(
				{
					src: url,
					href: './' + title.getPrefixedText(),
					width: 300,
					height: 'auto',
					resource: title.getPrefixedText(),
					mediaType: file.type,
					type: 'thumb',
					align: 'default',
					defaultSize: true

				},
				fragment.getDocument()
			);
			this.imageModel.insertImageNode( fragment );
		} else {
			title = mw.Title.newFromText( 'Media:' + fileName );

			surfaceModel = ve.init.target.getSurface().getModel();
			fragment = surfaceModel.getFragment();

			annotationTitle = ve.dm.MWInternalLinkAnnotation.static.newFromTitle(
				title, title.getPrefixedText()
			);

			fragment.insertContent( title.getMainText(), true );
			fragment.annotateContent( 'set', 'link/mwInternal', annotationTitle.element );
		}
	};

enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.insertExistingMedia =
	function ( fragment, fileName ) {
		var me = this,
			url = '', imageInfoApi = new mw.Api(), apiParams, title;
		// eslint-disable-next-line no-restricted-syntax
		if ( this.file.type.includes( 'image' ) ) {
			title = mw.Title.newFromText( 'File:' + fileName );
			apiParams = {
				action: 'query',
				format: 'json',
				prop: 'imageinfo',
				iiprop: 'url',
				titles: title.getPrefixedText()
			};

			imageInfoApi.get( apiParams ).done( function ( data ) {
				var pages = data.query.pages, p;
				for ( p in pages ) {
					url = pages[ p ].imageinfo[ 0 ].url;
				}
				me.insertMedia( fileName, url, me.file, fragment );
			} );
		} else {
			me.insertMedia( fileName, url, me.file );
		}
	};

enhancedUpload.ui.dialog.VEInsertMediaDialog.prototype.handleErrors =
// eslint-disable-next-line no-shadow-restricted-names
	function ( error, arguments, fileName, fragment ) {
		var me = this;
		if ( error === 'fileexists-no-change' ) {
			me.insertExistingMedia( fragment, fileName );
		}
		if ( error === 'duplicate' ) {
			var origFileName = arguments[ 1 ].upload.warnings.duplicate[ 0 ];
			OO.ui.confirm(
				mw.message( 'enhancedupload-ve-dialog-duplicate-confirm' ).plain() )
				.done( function ( confirmed ) {
					if ( confirmed ) {
						me.insertExistingMedia( fragment, origFileName );
					}
				} );
		}
		if ( error === 'exists' ) {
			OO.ui.prompt(
				mw.message( 'enhancedupload-ve-dialog-title-exists' ).plain(),
				{
					textInput: {
						placeholder: Date.now()
					}
				} )
				.done( function ( result ) {
					/* eslint-disable-next-line unicorn/prefer-string-slice */
					var fileFormat = me.file.name.substring( me.file.name.indexOf( '.' ) + 1 ),
						newFileName = result + '.' + fileFormat,
						params, dfdReUpload;
					if ( result !== null ) {
						params = {
							filename: newFileName,
							format: me.file.type,
							ignorewarnings: true
						};

						dfdReUpload = me.doUpload( me.file, params );
						dfdReUpload.done( function ( resp ) {
							me.insertMedia(
								newFileName,
								resp.upload.imageinfo.url,
								me.file,
								fragment
							);
							// eslint-disable-next-line no-undef
							me.close( { action: action } );
						} )
							// eslint-disable-next-line no-shadow-restricted-names
							.fail( function ( err, arguments ) {
								me.handleErrors( err, arguments, newFileName, fragment );
							} );
					}
				} );
		}
	};

/* Registration */
ve.ui.windowFactory.register( enhancedUpload.ui.dialog.VEInsertMediaDialog );
