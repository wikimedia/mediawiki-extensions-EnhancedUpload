<?php

namespace MediaWiki\Extension\EnhancedUpload\HookHandler;

use MediaWiki\Extension\EnhancedUpload\DiscoverySkin\GlobalActionsTool;
use MWStake\MediaWiki\Component\CommonUserInterface\Hook\MWStakeCommonUIRegisterSkinSlotComponents;

class CommonUserInterface implements MWStakeCommonUIRegisterSkinSlotComponents {

	/**
	 * @inheritDoc
	 */
	public function onMWStakeCommonUIRegisterSkinSlotComponents( $registry ): void {
		$registry->register(
			'GlobalActionsTools',
			[
				'bs-special-enhancedupload' => [
					'factory' => static function () {
						return new GlobalActionsTool();
					}
				]
			]
		);
	}
}
