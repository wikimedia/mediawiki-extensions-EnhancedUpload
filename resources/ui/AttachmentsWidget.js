window.enhancedUpload = window.enhancedUpload || {};
window.enhancedUpload.ui = window.enhancedUpload.ui || {};

enhancedUpload.ui.AttachmentsWidget = function ( cfg ) {
	enhancedUpload.ui.AttachmentsWidget.parent.call( this, cfg );
	this.pageID = cfg.pageID || 0;
	this.filesTitle = cfg.files || [];
	this.counter = cfg.counter || 0;
	this.tagTitle = cfg.title || '';
	this.loading = true;
	this.editRight = cfg.edit || false;
	this.defaultCategories = cfg.defaultCategories || '';
	this.defaultPrefix = cfg.defaultPrefix || '';
	this.defaultDescription = cfg.defaultDescription || '';
	this.skipOptions = cfg.skipOptions || false;
	this.hideVersion = cfg.hideVersion || false;
	this.hideEditor = cfg.hideEditor || false;
	this.showSize = cfg.showSize || false;
	this.showCategories = cfg.showCategories || false;

	this.$element = $( '<div>' );

	var $header = $( '<div>' ).addClass( 'attachments-header' ),
		$mainlabel = $( '<h2>' ).html( this.tagTitle );
	$header.append( $mainlabel );

	if ( this.editRight ) {
		this.addUploadWidget();
		var addNewFileInput = new OO.ui.SelectFileWidget( {
			title: mw.message( 'enhancedupload-attachments-add-new-media-button-title' ).plain(),
			button: {
				icon: 'upload',
				label: ''
			},
			buttonOnly: true,
			multiple: true,
			classes: [ 'add-existing-button' ]
		} );
		$( addNewFileInput.$input ).attr( 'multiple', 'true' );

		var addDataBtn = new OO.ui.ButtonWidget( {
			title: mw.message( 'enhancedupload-attachments-add-media-button-title' ).plain(),
			icon: 'add',
			classes: [ 'add-existing-button' ]
		} );
		addDataBtn.connect( this, {
			click: 'addExistingMedia'
		} );
		addNewFileInput.connect( this, {
			change: function () {
				var items = addNewFileInput.getValue();
				if ( !items.length ) {
					items = [ items ];
				}
				this.upload.startQuickUpload( items );
			}
		} );

		var buttonGroup = new OO.ui.ButtonGroupWidget( {
			items: [ addNewFileInput, addDataBtn ]
		} );

		$header.append( buttonGroup.$element );
	}
	this.$element.append( $header );

	this.dataLayout = new OO.ui.PanelLayout( {
		expanded: false
	} );

	this.$element.append( this.dataLayout.$element );
	this.addGrid();

	if ( this.editRight ) {
	// necessary to allow drop event
		this.$element.on( 'dragover', function ( event ) {
			$( this ).addClass( 'drag-file' );
			event.preventDefault();
			event.originalEvent.dataTransfer.dropEffect = 'move';
			event.originalEvent.dataTransfer.effectAllowed = 'move';
		} );
		this.$element.on( 'dragleave', function ( event ) {
			$( this ).removeClass( 'drag-file' );
			event.preventDefault();
			event.originalEvent.dataTransfer.dropEffect = 'none';
			event.originalEvent.dataTransfer.effectAllowed = 'none';
		} );

		this.$element.on( 'drop', function ( e ) {
			var uploadFiles = e.originalEvent.dataTransfer.files;
			this.upload.startQuickUpload( uploadFiles );
			e.preventDefault();
			$( this.$element ).removeClass( 'drag-file' );
		}.bind( this ) );
	}

};

OO.inheritClass( enhancedUpload.ui.AttachmentsWidget, OO.ui.Widget );

enhancedUpload.ui.AttachmentsWidget.prototype.addGrid = function () {
	var me = this, dataLoaded;
	if ( this.filesTitle.length > 0 ) {
		dataLoaded = this.getGridData();
		dataLoaded.done( function ( files ) {
			me.gridCfg = {
				pageSize: 10,
				columns: {
					filename: {
						headerText: mw.message( 'enhancedupload-attachments-tag-grid-file-label' ).plain(),
						type: 'url',
						editable: false,
						urlProperty: 'file_url',
						sortable: true,
						filter: { type: 'string' }
					}
				},
				data: files
			};
			me.setupColumns();

			me.grid = new OOJSPlus.ui.data.GridWidget( me.gridCfg );
			me.grid.connect( me, {
				action: function ( action, row ) {
					if ( action === 'details' ) {
						var fileTitle = mw.Title.newFromText( 'File:' + row.filename );
						window.open( fileTitle.getUrl(), '_blank' );
					}
					if ( action === 'remove' ) {
						OO.ui.confirm( mw.message( 'enhancedupload-attachments-confirm-remove', row.filename ).plain() )
							.done( function ( confirmed ) {
								if ( !confirmed ) {
									return;
								}
								me.removeItems( row );
							} );
					}
				}
			} );

			me.dataLayout.$element.append( me.grid.$element );
			me.emit( 'loaded', me.counter );
		} );
	} else {
		this.dataLayout.$element.append( mw.message( 'enhancedupload-attachments-tag-no-attached-files' ).plain() );
	}
};

enhancedUpload.ui.AttachmentsWidget.prototype.setupColumns = function () {
	if ( !this.hideVersion ) {
		this.gridCfg.columns.version = {
			headerText: mw.message( 'enhancedupload-attachments-tag-grid-version-label' ).plain(),
			type: 'text'
		};
	}

	if ( !this.hideEditor ) {
		this.gridCfg.columns.editor = {
			headerText: mw.message( 'enhancedupload-attachments-tag-grid-editor-label' ).plain(),
			type: 'url',
			editable: false,
			urlProperty: 'editor_url'
		};
	}

	if ( this.showSize ) {
		this.gridCfg.columns.size = {
			headerText: mw.message( 'enhancedupload-attachments-tag-grid-size-label' ).plain(),
			type: 'text',
			editable: false
		};
	}
	if ( this.showCategories ) {
		this.gridCfg.columns.categories = {
			headerText: mw.message( 'enhancedupload-attachments-tag-grid-category-label' ).plain(),
			type: 'url',
			editable: false,
			urlProperty: 'category_url',
			limitShownData: true,
			limitValue: 2
		};
	}

	this.gridCfg.columns.details = {
		type: 'action',
		title: mw.message( 'enhancedupload-attachments-tag-grid-details-title' ).plain(),
		actionId: 'details',
		icon: 'infoFilled'
	};

	if ( this.editRight ) {
		this.gridCfg.columns.remove = {
			type: 'action',
			title: mw.message( 'enhancedupload-attachments-tag-grid-remove-title' ).plain(),
			actionId: 'remove',
			icon: 'close'
		};
	}
};

enhancedUpload.ui.AttachmentsWidget.prototype.getGridData = function () {
	var me = this,
		dfd = new $.Deferred();

	mw.loader.using( 'mediawiki.api' ).done( function () {
		var files = [], dfds = [], i, fileTitle, dfdInfo;
		for ( i = 0; i < me.filesTitle.length; i++ ) {
			fileTitle = me.filesTitle[ i ];
			dfdInfo = me.getFileInfo( fileTitle );
			dfdInfo.done( function ( pages ) {
				var categories = [], title, size, time, url, p, user;
				for ( p in pages ) {
					categories = [];
					title = mw.Title.newFromText( pages[ p ].title );
					size = me.calculateSize( pages[ p ].imageinfo[ 0 ].size );
					time = me.getFormattedTime( pages[ p ].imageinfo[ 0 ].timestamp );
					user = pages[ p ].imageinfo[ 0 ].user;
					url = pages[ p ].imageinfo[ 0 ].url;
					if ( pages[ p ].categories ) {
						categories = me.getCategories( pages[ p ].categories );
					}

					files.push( {
						filename: title.getMainText(),
						// eslint-disable-next-line camelcase
						file_url: url,
						size: size,
						version: time,
						categories: categories.map( function ( category ) {
							return category.name;
						} ),
						// eslint-disable-next-line camelcase
						category_url: categories.map( function ( category ) {
							return category.url;
						} ),
						editor: user,
						// eslint-disable-next-line camelcase
						editor_url: mw.Title.newFromText( user, 2 ).getUrl()
					} );
				}
			} );
			dfds.push( dfdInfo );
		}
		$.when.apply( me, dfds ).done( function () {
			dfd.resolve( files );
		} );
	} );
	return dfd.promise();

};

enhancedUpload.ui.AttachmentsWidget.prototype.getFormattedTime = function ( timestamp ) {
	var dateSetting = mw.user.options.values.date;
	var monthID = timestamp.slice( 5, 7 ) - 1;

	if ( dateSetting === 'ISO 8601' ) {
		return timestamp;
	}
	var date = new Date( timestamp ).toLocaleDateString();
	return this.insertMonth( date, monthID );
};

enhancedUpload.ui.AttachmentsWidget.prototype.insertMonth = function ( date, monthID ) {
	var month = ' ' + mw.language.months.names[ monthID ] + ' ';
	var posStart = date.indexOf( '.' ) + 1;
	var posEnd = date.lastIndexOf( '.' ) + 1;
	date = date.slice( 0, posStart ) + month + date.slice( posEnd );
	return date;
};

enhancedUpload.ui.AttachmentsWidget.prototype.getFileInfo = function ( fileTitle ) {
	var dfd = new $.Deferred(),
		imageInfoApi = new mw.Api(),
		title = mw.Title.newFromText( 'File:' + fileTitle ),
		params = {
			action: 'query',
			format: 'json',
			prop: 'imageinfo|categories',
			iiprop: 'size|timestamp|url|user',
			titles: title.getPrefixedText()
		};

	imageInfoApi.get( params ).done( function ( data ) {
		dfd.resolve( data.query.pages );
	} );

	return dfd.promise();
};

enhancedUpload.ui.AttachmentsWidget.prototype.getCategories = function ( categoriesInfo ) {
	var categories = [], title, category;
	for ( category in categoriesInfo ) {
		title = mw.Title.newFromText( categoriesInfo[ category ].title );
		categories.push( {
			name: title.getMainText(),
			url: title.getUrl()
		} );
	}
	return categories;
};

enhancedUpload.ui.AttachmentsWidget.prototype.calculateSize = function ( bytes ) {
	var i = 0,
		units = [ ' b', ' KB', ' MB', ' GB', ' TB', ' PB' ];

	if ( bytes > 0 ) {
		for ( i = 0; bytes >= 1024; bytes /= 1024 ) {
			i++;
		}
	}

	return bytes.toFixed( i > 0 ? 1 : 0 ) + units[ i ];
};

enhancedUpload.ui.AttachmentsWidget.prototype.addUploadWidget = function () {
	var $container = $( '<div>' ).addClass( 'enhancedUpload-widget' );
	this.upload = new enhancedUpload.ui.UploadWidget( {
		container: $container,
		hidePreview: true,
		categories: this.defaultCategories,
		prefix: this.defaultPrefix,
		description: this.defaultDescription,
		skipOptions: this.skipOptions
	} );
	this.upload.connect( this, {
		uploadComplete: 'addItems'
	} );

	this.$element.append( $container );
};

enhancedUpload.ui.AttachmentsWidget.prototype.addItems = function ( widget, items, pageNames ) {
	var me = this;

	if ( items.length < 1 ) {
		return;
	}

	mw.loader.using( 'ext.enhancedUpload.attachments.api' ).done( function () {
		var api = new enhancedUpload.api.Api(),
			addFiles = api.addFiles( me.pageID, me.counter, items, pageNames );
		addFiles.done( function () {
			window.location.reload();
		} );
	} );
};

enhancedUpload.ui.AttachmentsWidget.prototype.removeItems = function ( row ) {
	var me = this,
		items = [ row.filename ];

	mw.loader.using( 'ext.enhancedUpload.attachments.api' ).done( function () {
		var api = new enhancedUpload.api.Api(),
			removedFile = api.removeFiles( me.pageID, me.counter, items );
		removedFile.done( function () {
			window.location.reload();
		} );
	} );
};

enhancedUpload.ui.AttachmentsWidget.prototype.addExistingMedia = function () {
	var me = this;
	mw.loader.using( 'ext.enhancedUpload.attachments.addMediaDialog' ).done( function () {
		this.media = new enhancedUpload.ui.dialog.AddExistingMediaDialog( {
			size: 'medium',
			classes: [ 'attachments-add-dialog' ]
		} );

		this.media.on( 'actioncompleted', function ( title ) {
			mw.loader.using( 'ext.enhancedUpload.attachments.api' ).done( function () {
				var api = new enhancedUpload.api.Api();
				var titleText = title.getMainText();

				if ( title.getNamespaceId() !== 6 ) {
					titleText = title.getPrefixedText();
				}

				var addLink = api.addLink( me.pageID, me.counter, [ titleText ] );
				addLink.done( function () {
					window.location.reload();
				} );
			} );
		} );
		this.media.show();
	} );
};
