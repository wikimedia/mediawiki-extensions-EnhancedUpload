<?php

namespace MediaWiki\Extension\EnhancedUpload;

class AttachmentTagModifier {

	public function __construct() {
	}

	/**
	 *
	 * @param string $wikiText
	 * @param int $count
	 * @param array $files
	 * @return string
	 */
	public function add( $wikiText, $count, $files ) {
		$tags = preg_match_all(
			"#(< ?attachments[^\/]*?>.*?< ?/ ?attachments ?>|< ?attachments.*?/ ?>)#is",
			$wikiText,
			$matches
		);

		if ( $tags ) {
			if ( $count <= count( $matches[0] ) ) {
				$attachment = $matches[0][ $count ];
				if ( $attachment ) {
					$insertPosition = strrpos( $attachment, '<' );
					$filenames = $this->buildFileEntry( $files );
					$newContent = substr_replace( $attachment, $filenames, $insertPosition, 0 );
				}
				$wikiText = str_replace( $attachment, $newContent, $wikiText );
			}
		}

		return $wikiText;
	}

	/**
	 *
	 * @param string $wikiText
	 * @param int $count
	 * @param array $files
	 * @return string
	 */
	public function remove( $wikiText, $count, $files ) {
		$tags = preg_match_all(
			"#(< ?attachments[^\/]*?>.*?< ?/ ?attachments ?>|< ?attachments.*?/ ?>)#is",
			$wikiText,
			$matches
		);

		if ( $tags ) {
			if ( $count <= count( $matches[0] ) ) {
				$attachment = $matches[0][ $count ];
				if ( $attachment ) {
					foreach ( $files as $filename ) {
						$file = "* [[Media:$filename]]\n";
						$newContent = str_replace( $file, '', $attachment );

						$normalFilename = str_replace( ' ', '_', $filename );
						$normalFile = "* [[Media:$normalFilename]]\n";
						$newContent = str_replace( $normalFile, '', $newContent );

						$normalFilenameAlt = str_replace( '_', ' ', $filename );
						$normalFileAlt = "* [[Media:$normalFilenameAlt]]\n";
						$newContent = str_replace( $normalFileAlt, '', $newContent );

						$wikiText = str_replace( $attachment, $newContent, $wikiText );
					}
				}
			}
		}

		return $wikiText;
	}

	/**
	 *
	 * @param array $files
	 * @return string
	 */
	private function buildFileEntry( $files ) {
		$content = '';
		foreach ( $files as $fileName ) {
			$normalFilename = str_replace( ' ', '_', $fileName );
			$content .= "* [[Media:$normalFilename]]\n";
		}

		return $content;
	}

}
