<?php

namespace MediaWiki\Extension\EnhancedUpload\Special;

use MediaWiki\Html\Html;
use MediaWiki\SpecialPage\SpecialPage;

class EnhancedUpload extends SpecialPage {

	public function __construct() {
		parent::__construct( 'EnhancedUpload', 'upload' );
	}

	/**
	 *
	 * @param string $par
	 */
	public function execute( $par ) {
		$this->setHeaders();

		$this->checkPermissions();

		$this->getOutput()->addModules( "ext.enhancedUpload" );

		$this->getOutput()->enableOOUI();

		$this->getOutput()->addHTML(
			Html::element( 'div', [
				'id' => 'enhancedUpload-container'
			] )
		);
	}

	/**
	 * @inheritDoc
	 */
	protected function getGroupName() {
		return 'media';
	}
}
