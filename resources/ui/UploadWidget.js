window.enhancedUpload = window.enhancedUpload || {};
window.enhancedUpload.ui = window.enhancedUpload.ui || {};

enhancedUpload.ui.UploadWidget = function enhancedUploadUiUploadWidget( cfg ) {
	cfg = cfg || {};
	enhancedUpload.ui.UploadWidget.parent.call( this, cfg );

	var pluginModules = require( './pluginModules.json' );
	this.namespaces = mw.config.get( 'wgFormattedNamespaces' );
	this.pluginModules = pluginModules || [];
	this.hideFinishedDialog = cfg.hideFinishedDialog || false;
	this.emitUploadData = cfg.emitUploadData || false;
	this.skipOptions = cfg.skipOptions || false;
	this.defaultCategories = cfg.categories || '';
	this.defaultPrefix = cfg.prefix || '';
	this.defaultDescription = cfg.description || '';

	this.displayedItems = [];
	this.allItems = [];
	this.expanded = true;
	this.warnings = [
		'fileexists-no-change',
		'page-exists',
		'exists',
		'exists-normalized',
		'was-deleted',
		'duplicate'
	];

	// eslint-disable-next-line no-jquery/no-global-selector
	this.$mainContainer = cfg.container || $( '#enhancedUpload-container' );
	this.hidePreview = cfg.hidePreview || false;
	this.hideInput = cfg.hideInput || false;
	mw.loader.using( this.pluginModules ).done( function () {
		this.setupFileWidgets();
		this.setupDetailsWidgets();
		this.setupActionButtons();

		this.$mainContainer.append( this.selectFiles.$element );
		mw.hook( 'upload.init' ).fire( this.detailsWidget );
		if ( !this.hidePreview ) {
			this.$mainContainer.append( this.previewWidgetLayout.$element );
			this.$mainContainer.append( this.headerLine.$element );
			this.$mainContainer.append( this.detailsWidget.$element );
			this.$mainContainer.append( this.actionFieldLayout.$element );
		}
	}.bind( this ) );
};

OO.inheritClass( enhancedUpload.ui.UploadWidget, OO.ui.Widget );

enhancedUpload.ui.UploadWidget.static.label = '';

enhancedUpload.ui.UploadWidget.static.tagName = 'div';

enhancedUpload.ui.UploadWidget.prototype.setupFileWidgets = function () {
	this.selectFiles = new OOJSPlus.ui.widget.MultiSelectFileWidget( {
		showDropTarget: true
	} );

	if ( this.hidePreview ) {
		this.selectFiles.connect( this, {
			change: 'startQuickUpload'
		} );
	} else {
		this.selectFiles.connect( this, {
			change: 'updateUIFiles'
		} );

		this.previewWidget = new enhancedUpload.ui.panel.Preview();

		this.previewWidget.connect( this, {
			updateElements: 'emptyFiles'
		} );

		this.previewWidgetLayout = new OO.ui.FieldLayout( this.previewWidget, {
			label: mw.message( 'enhancedupload-preview-widget-label' ).plain(),
			align: 'top',
			classes: [ 'file-preview-widget', 'no-files' ]
		} );
	}
};

enhancedUpload.ui.UploadWidget.prototype.setupDetailsWidgets = function () {
	this.toggleButton = new OO.ui.ButtonWidget( {
		icon: this.expanded ? 'collapse' : 'expand',
		framed: false,
		classes: [ 'toggle-icon', 'collapsed-panel' ]
	} );

	this.toggleButton.connect( this, {
		click: 'onToggle'
	} );

	this.headerLine = new OO.ui.HorizontalLayout( {
		items: [
			new OO.ui.LabelWidget( {
				label: mw.message( 'enhancedupload-details-header-label' ).plain()
			} ),
			this.toggleButton
		],
		classes: [ 'heading' ]
	} );

	this.detailsWidget = new enhancedUpload.ui.widget.DetailsUploadWidget();

	if ( !this.expanded ) {
		this.detailsWidget.$element.hide();
	}
};

enhancedUpload.ui.UploadWidget.prototype.setupActionButtons = function () {
	this.submitButton = new OO.ui.ButtonWidget( {
		label: mw.message( 'enhancedupload-upload-button-label' ).plain(),
		title: '',
		flags: [ 'primary', 'progressive' ]
	} );

	this.cancelButton = new OO.ui.ButtonWidget( {
		label: mw.message( 'enhancedupload-cancel-button-label' ).plain()
	} );

	this.actionFieldLayout = new OO.ui.HorizontalLayout( {
		items: [ this.cancelButton, this.submitButton ],
		classes: [ 'buttonField' ]
	} );

	this.cancelButton.connect( this, {
		click: 'emptyFiles'
	} );

	this.submitButton.connect( this, {
		click: 'startUpload'
	} );
};

enhancedUpload.ui.UploadWidget.prototype.updateUIFiles = function () {
	var items = this.previewWidget.getFiles();
	if ( items.length === 0 ) {
		this.previewWidget.showPreview();
		$( this.previewWidgetLayout.$element ).removeClass( 'no-files' );
	}

	var values = this.selectFiles.getValue();
	for ( var i = 0; i < values.length; i++ ) {
		var previewHasItem = this.itemExists( items, values[ i ] );
		var inList = this.allItems.indexOf( values[ i ] ) === -1;
		if ( inList && !previewHasItem ) {
			this.allItems.push( values[ i ] );
			this.getUrl( values[ i ] );
		}
	}

	this.emit( 'filesUpdated' );
};

enhancedUpload.ui.UploadWidget.prototype.itemExists = function ( items, value ) {
	return items.some( function ( item ) {
		if ( item.data === value ) {
			return true;
		}
		return false;
	} );
};

enhancedUpload.ui.UploadWidget.prototype.getUrl = function ( value ) {
	var me = this;
	var dfd = $.Deferred();
	this.selectFiles.loadAndGetImageUrl( value ).done( function ( url ) {
		me.previewWidget.addToPreview( value, url );
		dfd.resolve( url );
	} ).fail( function () {
		me.previewWidget.addToPreview( value );
		dfd.reject();
	} );

	return dfd.promise();
};

enhancedUpload.ui.UploadWidget.prototype.onToggle = function () {
	if ( !this.expanded ) {
		// eslint-disable-next-line no-jquery/no-slide
		this.detailsWidget.$element.slideDown( 300, function () {
			this.toggleButton.setIcon( 'collapse' );
			this.expanded = true;
		}.bind( this ) );
	} else {
		// eslint-disable-next-line no-jquery/no-slide
		this.detailsWidget.$element.slideUp( 300, function () {
			this.toggleButton.setIcon( 'expand' );
			this.expanded = false;
		}.bind( this ) );
	}
};

enhancedUpload.ui.UploadWidget.prototype.emptyFiles = function () {
	this.selectFiles.setValue( '' );
	this.allItems.splice( 0, this.allItems.length );
	this.previewWidget.clearPreview();
	$( this.previewWidgetLayout.$element ).addClass( 'no-files' );
	this.detailsWidget.setToDefault();
};

enhancedUpload.ui.UploadWidget.prototype.setUpProgressBar = function () {
	this.uploadProgressBar = new OO.ui.ProgressBarWidget( {
		classes: [ 'progressbar-upload' ]
	} );

	// eslint-disable-next-line no-jquery/no-parse-html-literal
	this.$overlay = $( '<div id="upload-overlay">' )
		.addClass( 'enhancedUpload-loading-overlay' )
		.append( this.uploadProgressBar.$element );
	this.$overlay.appendTo( document.body );
	$( document.body ).addClass( 'upload-open' );
};

enhancedUpload.ui.UploadWidget.prototype.startUpload = function () {
	var items = this.previewWidget.getFiles();

	if ( !items.length ) {
		OO.ui.alert(
			mw.message( 'enhancedupload-alert-missing-files' ).text()
		);
		return;
	}

	var me = this;
	me.setUpProgressBar();
	me.fetchFailedUploads = [];
	me.fetchFinishedUploads = [];
	me.fetchWarningUploads = [];
	mw.loader.using( 'mediawiki.api' ).done( function () {
		me.uploadProgressBar.setProgress( ( 0.5 / items.length ) * 100 );
		var uploadDfds = [];
		var descAndCommentText = me.detailsWidget.getDescription() + ' ' + me.detailsWidget.getCategories();

		for ( var i = 0; i < items.length; i++ ) {
			var params = {
				filename: items[ i ].data.name,
				format: items[ i ].data.type,
				ignorewarnings: true,
				comment: descAndCommentText
			};

			mw.hook( 'upload.getUploadParams' ).fire( params );

			var uploadDfd = me.doUpload( items[ i ].data, params );
			$.when.apply( me, uploadDfd ).done( function ( dfd, progress, maxUpload ) {
				uploadDfds.push( dfd );
				me.uploadProgressBar.setProgress( ( progress / ( maxUpload - 1 ) ) * 100 );

			}( uploadDfd, i, items.length ) ).fail( function ( dfd, progress, maxUpload ) {
				uploadDfds.push( dfd );
				me.uploadProgressBar.setProgress( ( progress / ( maxUpload - 1 ) ) * 100 );
			}( uploadDfd, i, items.length ) );
		}

		$.when.apply( me, uploadDfds ).done( function () {
			me.emptyFiles();
			$( me.$overlay ).remove();
			$( document.body ).removeClass( 'upload-open' );

			if ( !me.hideFinishedDialog ) {
				me.finishedDialog = new enhancedUpload.ui.dialog.UploadFinishedDialog( {
					size: 'large',
					data: [ me.fetchFinishedUploads, me.fetchFailedUploads, me.fetchWarningUploads ]
				} );
				me.finishedDialog.show();
			}
			if ( me.emitUploadData ) {
				me.emit( 'uploadData', [ me.fetchFinishedUploads, me.fetchFailedUploads, me.fetchWarningUploads ] );
			}

			me.emit( 'uploadComplete', me, items );
		} );

	} ).fail( function () {
		$( me.$overlay ).remove();
		$( document.body ).removeClass( 'upload-open' );
	} );
};

enhancedUpload.ui.UploadWidget.prototype.getFileName = function ( name ) {
	var namespaceId = this.namespaceInput.getValue();
	var namespace = this.namespaces[ namespaceId ];

	if ( namespaceId === 0 ) {
		return name;
	} else {
		return namespace + ':' + name;
	}
};

enhancedUpload.ui.UploadWidget.prototype.doUpload = function ( file, params ) {
	var me = this;
	var mwApi = new mw.Api();
	var dfd = new $.Deferred();

	mwApi.upload( file, params ).then( function ( resp ) {
		me.fetchFinishedUploads.push( [ resp.upload.imageinfo.canonicaltitle, file ] );
		dfd.resolve( resp );
	}, ( function ( error ) {
		if ( me.warnings.indexOf( error ) === -1 ) {
			me.fetchFailedUploads.push( [ error, file ] );
			dfd.resolve( error );
		} else {
			me.fetchWarningUploads.push( [ error, file ] );
			dfd.resolve();
		}
	} ) );

	return dfd.promise();
};

enhancedUpload.ui.UploadWidget.prototype.startQuickUpload = function ( items ) {
	if ( !items.length ) {
		return;
	}

	if ( !this.skipOptions ) {
		var dialog = new enhancedUpload.ui.dialog.DetailsDialog( {
			categories: this.defaultCategories,
			prefix: this.defaultPrefix,
			description: this.defaultDescription
		} );

		dialog.show();
		mw.hook( 'upload.init' ).fire( dialog.details );
		mw.hook( 'upload.setNamespaceValue' ).fire( this.defaultPrefix );
		dialog.on( 'detailscompleted', function ( descCatText ) {
			this.quickUpload( items, descCatText );
		}.bind( this ) );
	} else {
		var descAndCatText = this.defaultDescription + ' ' + this.formatCategories();
		this.quickUpload( items, descAndCatText );
	}
};

enhancedUpload.ui.UploadWidget.prototype.quickUpload = function ( items, descAndCatText ) {
	var me = this;
	me.fetchFailedUploads = [];
	me.fetchFinishedUploads = [];
	me.fetchWarningUploads = [];
	me.setUpProgressBar();
	mw.loader.using( 'mediawiki.api' ).done( function () {
		me.uploadProgressBar.setProgress( ( 0.5 / items.length ) * 100 );
		var uploadDfds = [];
		var pageNames = [];

		for ( var i = 0; i < items.length; i++ ) {
			var params = {
				filename: items[ i ].name,
				format: items[ i ].type,
				ignorewarnings: true,
				comment: descAndCatText
			};
			if ( !me.skipOptions ) {
				mw.hook( 'upload.getUploadParams' ).fire( params, me.defaultPrefix );
			} else {
				mw.hook( 'upload.getPrefixParams' ).fire( params, me.defaultPrefix );
			}
			if ( params.filename === items[ i ].name && me.defaultPrefix !== '' ) {
				params.filename = me.defaultPrefix + '.' + items[ i ].name;
			}
			pageNames.push( params.filename );
			var uploadDfd = me.doUpload( items[ i ], params );
			$.when( uploadDfd ).done( function ( dfd, progress, maxUpload ) {
				uploadDfds.push( dfd );
				me.uploadProgressBar.setProgress( ( progress / ( maxUpload - 1 ) ) * 100 );
			}( uploadDfd, i, items.length ) ).fail( function ( dfd, progress, maxUpload ) {
				uploadDfds.push( dfd );
				me.uploadProgressBar.setProgress( ( progress / ( maxUpload - 1 ) ) * 100 );
			}( uploadDfd, i, items.length ) );
		}
		$.when.apply( me, uploadDfds ).done( function () {
			me.selectFiles.setValue( '' );
			$( me.$overlay ).remove();
			$( document.body ).removeClass( 'upload-open' );
			if ( me.fetchFailedUploads.length ) {
				me.handleFailedQuickUpload( items, pageNames );
			} else {
				me.emit( 'uploadComplete', me, items, pageNames );
			}
		} );
		$( me.$overlay ).remove();
		$( document.body ).removeClass( 'upload-open' );

	} );
};

enhancedUpload.ui.UploadWidget.prototype.processUpload =
	function ( uploadDfd, progress, maxUpload ) {
		this.uploadDfds.push( uploadDfd );
		this.uploadProgressBar.setProgress( ( progress / ( maxUpload - 1 ) ) * 100 );
	};

enhancedUpload.ui.UploadWidget.prototype.formatCategories = function () {
	var categories = this.defaultCategories.split( '|' );
	var category = '';
	for ( var i = 0; i < categories.length; i++ ) {
		var cat = '[[Category:' + categories[ i ] + ']] ';
		category += cat;
	}
	return category;
};

enhancedUpload.ui.UploadWidget.prototype.handleFailedQuickUpload = function ( items, pageNames ) {
	var me = this;
	me.finishedDialog = new enhancedUpload.ui.dialog.UploadFinishedDialog( {
		size: 'large',
		data: [ [], me.fetchFailedUploads, [] ]
	} );

	for ( var item in me.fetchFailedUploads ) {
		var file = me.fetchFailedUploads[ item ][ 1 ];
		var index = items.indexOf( file );
		items.splice( index, 1 );
	}
	if ( items.length ) {
		me.finishedDialog.connect( this, {
			close: function () {
				me.emit( 'uploadComplete', me, items, pageNames );
			}
		} );
	}
	me.finishedDialog.show();
};
