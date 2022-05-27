<?php

use MediaWiki\Extension\EnhancedUpload\AttachmentTagModifier;

return [
	'EnhancedUploadAttachmentTagModifier' => static function () {
		return new AttachmentTagModifier();
	},
];
