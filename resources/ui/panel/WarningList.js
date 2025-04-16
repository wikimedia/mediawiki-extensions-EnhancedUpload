window.enhancedUpload = window.enhancedUpload || {};
window.enhancedUpload.ui.panel = window.enhancedUpload.ui.panel || {};

enhancedUpload.ui.panel.WarningList = function enhancedUploadUiPanelWarningList( cfg ) {
	enhancedUpload.ui.panel.WarningList.parent.call( this, cfg );
	this.data = [];

	this.$grid = $( '<div>' );
	this.$element.append( this.$grid );
};
OO.inheritClass( enhancedUpload.ui.panel.WarningList, OO.ui.HorizontalLayout );

enhancedUpload.ui.panel.WarningList.prototype.addGrid = function ( data ) {
	var gridCfg = {}, i, error, filename;
	var self = this;

	this.parseMessages( data ).then( function ( result ) {
		if ( !result ) {
			for ( i = 0; i < data.length; i++ ) {
				filename = data[ i ][ 1 ].name;
				error = data[ i ][ 0 ];
				self.data.push( {
					name: filename,
					error: error
				} );
			}
		} else {
			for ( i = 0; i < data.length; i++ ) {
				filename = data[ i ][ 1 ].name;
				error = result[ i ];
				self.data.push( {
					name: filename,
					error: error
				} );
			}
		}
		gridCfg = {
			pageSize: 10,
			border: 'horizontal',
			toolbar: false,
			columns: {
				name: {
					headerText: mw.message( 'enhancedupload-list-header-filename' ).plain(),
					type: 'text'
				},
				error: {
					headerText: mw.message( 'enhancedupload-list-header-warning' ).plain(),
					type: 'text',
					valueParser: function ( value ) {
						return new OO.ui.HtmlSnippet( value );
					}
				}
			},
			data: self.data
		};
		var voGrid = new OOJSPlus.ui.data.GridWidget( gridCfg );
		self.$grid.html( voGrid.$element );
		self.emit( 'dataset' );
	} );
};

enhancedUpload.ui.panel.WarningList.prototype.parseMessages = function ( data ) {
	var dfd = $.Deferred(),
		resultsDfd = [],
		results = [];

	for ( var i = 0; i < data.length; i++ ) {
		var errorText = data[ i ][ 0 ];
		var parseDfd = this.parse( errorText );
		parseDfd.done( function ( parsedText ) {
			results.push( parsedText );
		} )
			.fail( function () {
				dfd.reject();
			} );
		resultsDfd.push( parseDfd );
	}

	$.when.apply( $, resultsDfd ).done( function () {
		dfd.resolve( results );
	} );

	return dfd.promise();
};

enhancedUpload.ui.panel.WarningList.prototype.parse = function ( text ) {
	var dfd = $.Deferred(),
		api = new mw.Api();

	api.parse( text ).done( function ( data ) {
		dfd.resolve( data );
	} )
		.fail( function () {
			dfd.reject();
		} );

	return dfd.promise();
};
