<?php

namespace MediaWiki\Extension\EnhancedUpload\DiscoverySkin;

use Message;
use MWStake\MediaWiki\Component\CommonUserInterface\Component\RestrictedTextLink;
use SpecialPage;

class GlobalActionsTool extends RestrictedTextLink {

	/**
	 *
	 */
	public function __construct() {
		parent::__construct( [] );
	}

	/**
	 *
	 * @return string
	 */
	public function getId(): string {
		return 'ga-enhanced-upload';
	}

	/**
	 *
	 * @return string[]
	 */
	public function getPermissions(): array {
		$permissions = [
			'upload'
		];
		return $permissions;
	}

	/**
	 * @return string
	 */
	public function getHref(): string {
		$specialPage = SpecialPage::getTitleFor( 'EnhancedUpload' );
		return $specialPage->getLocalURL();
	}

	/**
	 * @return Message
	 */
	public function getText(): Message {
		return Message::newFromKey( 'enhancedupload-text' );
	}

	/**
	 * @return Message
	 */
	public function getTitle(): Message {
		return Message::newFromKey( 'enhancedupload-desc' );
	}

	/**
	 * @return Message
	 */
	public function getAriaLabel(): Message {
		return Message::newFromKey( 'enhancedupload-text' );
	}
}
