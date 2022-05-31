window.enhancedUpload = window.enhancedUpload || {};
window.enhancedUpload.api = window.enhancedUpload.api || {};

enhancedUpload.api.Api = function () {
};

OO.initClass( enhancedUpload.api.Api );

enhancedUpload.api.Api.prototype.put = function ( path, params ) {
	params = params || {};
	return this.ajax( path, JSON.stringify( { files: params } ), 'PUT' );
};

enhancedUpload.api.Api.prototype.makeUrl = function ( path ) {
	if ( path.charAt( 0 ) === '/' ) {
		path = path.slice( 1 );
	}

	return mw.util.wikiScript( 'rest' ) + '/enhancedupload/' + path;
};

enhancedUpload.api.Api.prototype.ajax = function ( path, data, method ) {
	var dfd = $.Deferred();
	data = data || {};

	$.ajax( {
		method: method,
		url: this.makeUrl( path ),
		data: data,
		contentType: 'application/json',
		dataType: 'json'
	} ).done( function ( response ) {
		if ( response.success === true ) {
			dfd.resolve( response );
		}
		dfd.reject( { status: response.status } );
	} ).fail( function ( jgXHR, type, status ) {
		if ( type === 'error' ) {
			dfd.reject( {
				error: jgXHR.responseJSON || jgXHR.responseText
			} );
		}
		dfd.reject( { type: type, status: status } );
	} );

	return dfd.promise();
};

enhancedUpload.api.Api.prototype.addFiles = function ( pageId, tagcounter, data, pageNames ) {
	var files = [], item;
	for ( item in pageNames ) {
		files.push( pageNames[ item ] );
	}
	return this.put( 'addattachments/' + pageId + '/' + tagcounter, files );
};

enhancedUpload.api.Api.prototype.removeFiles = function ( pageId, tagcounter, data ) {
	return this.put( 'removeattachments/' + pageId + '/' + tagcounter, data );
};

enhancedUpload.api.Api.prototype.addLink = function ( pageId, tagcounter, data ) {
	return this.put( 'addattachments/' + pageId + '/' + tagcounter, data );
};
