<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MediaWiki\Extension\EnhancedUpload\Hook\SpecialPage_initList;

use MediaWiki\Extension\EnhancedUpload\Special\EnhancedUpload;

class OverwriteSpecialUpload {

	/**
	 *
	 * @param array &$specialPages
	 * @return void
	 */
	public static function onSpecialPage_initList( &$specialPages ) {
		$specialPages['Upload'] = EnhancedUpload::class;
		return true;
	}
}
