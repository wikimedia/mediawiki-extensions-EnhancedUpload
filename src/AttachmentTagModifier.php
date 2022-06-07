<?php

namespace MediaWiki\Extension\EnhancedUpload;

use Title;
use TitleFactory;

class AttachmentTagModifier {

	/**
	 * @var TitleFactory
	 */
	private $titleFactory = null;

	/**
	 * @var string[]
	 */
	private $files = [];

	/**
	 * @var int
	 */
	private $counter = 0;

	/**
	 * @var int
	 */
	private $targetCount = 0;

	/**
	 * @param TitleFactory $titleFactory
	 */
	public function __construct( $titleFactory ) {
		$this->titleFactory = $titleFactory;
	}

	/**
	 *
	 * @param string $wikiText
	 * @param int $count
	 * @param array $files
	 * @return string
	 */
	public function add( $wikiText, $count, $files ) {
		if ( count( $files ) === 0 ) {
			return $wikiText;
		}
		$this->counter = 0;
		$this->targetCount = $count;
		$this->files = $files;
		$wikiText = preg_replace_callback(
			"#(< ?attachments[^\/]*?>.*?< ?/ ?attachments ?>|< ?attachments.*?/ ?>)#is",
			[ $this, 'addModified' ],
			$wikiText
		);
		return $wikiText;
	}

	/**
	 *
	 * @param array $matches
	 * @return string
	 */
	protected function addModified( $matches ) {
		if ( $this->counter !== $this->targetCount ) {
			$this->counter++;
			return $matches[ 0 ];
		}

		$this->counter++;
		$contentInArray = explode( "\n", $matches[ 1 ] );
		$newLines = [];
		foreach ( $this->files as $file ) {
			if ( !$this->titleExists( $contentInArray, $file ) ) {
				$fileEntry = $this->buildFileEntry( $file );
				$newLines[] = $fileEntry;
			}
		}
		$insertPosition = count( $contentInArray ) - 1;
		array_splice( $contentInArray, $insertPosition, 0, $newLines );
		$modifiedContent = implode( "\n", $contentInArray );
		return $modifiedContent;
	}

	/**
	 * @param string[] $entries
	 * @param string $file e.g. `ABC.pdf`
	 * @return bool
	 */
	private function titleExists( $entries, $file ) {
		$fileTitle = $this->titleFactory->makeTitle( NS_MEDIA, $file );

		if ( !$fileTitle ) {
			return false;
		}
		foreach ( $entries as $entry ) {
			$matches = [];
			$removeLine = preg_match( '#\[\[(.*?)\]\]#', $entry, $matches );
			if ( $removeLine ) {
				$target = $matches[1];
				$title = $this->getTitleFromTarget( $target );
				if ( $title ) {
					if ( $fileTitle->equals( $title ) ) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * @param string $targetText e.g. `Media:ABC.pdf| My file`
	 * @return Title
	 */
	private function getTitleFromTarget( $targetText ) {
		$parts = explode( '|', $targetText, 2 );
		$target = $parts[0];
		return $this->titleFactory->newFromText( $target );
	}

	/**
	 * @param string $file
	 * @return string
	 */
	private function buildFileEntry( $file ) {
		$normalFilename = str_replace( ' ', '_', $file );
		return "* [[Media:$normalFilename]]";
	}

	/**
	 *
	 * @param string $wikiText
	 * @param int $count
	 * @param array $files
	 * @return string
	 */
	public function remove( $wikiText, $count, $files ) {
		$this->counter = 0;
		$this->targetCount = $count;
		$this->files = $files;
		$wikiText = preg_replace_callback(
			"#(< ?attachments[^\/]*?>.*?< ?/ ?attachments ?>|< ?attachments.*?/ ?>)#is",
			[ $this, 'removeModified' ],
			$wikiText
		);
		return $wikiText;
	}

	/**
	 *
	 * @param array $matches
	 * @return string
	 */
	protected function removeModified( $matches ) {
		if ( $this->counter !== $this->targetCount ) {
			$this->counter++;
			return $matches[ 0 ];
		}

		$this->counter++;
		$contentInArray = explode( "\n", $matches[ 1 ] );
		$newLines = [];
		foreach ( $contentInArray as $existingLine ) {
			if ( !$this->shouldLineRemoved( $existingLine ) ) {
				$newLines[] = $existingLine;
			}
		}

		$modifiedContent = implode( "\n", $newLines );
		return $modifiedContent;
	}

	/**
	 * @param string $line e.g. `* [[Media:ABC.pdf]]`
	 * @return bool
	 */
	private function shouldLineRemoved( $line ) {
		$matches = [];
		$removeLine = preg_match( '#\[\[(.*?)\]\]#', $line, $matches );

		if ( !$removeLine ) {
			return false;
		}

		$targetAndAlias = $matches[1];
		$title = $this->getTitleFromTarget( $targetAndAlias );
		if ( $title ) {
			foreach ( $this->files as $file ) {
				$fileTitle = $this->titleFactory->makeTitle( NS_MEDIA, $file );

				if ( $fileTitle ) {
					if ( $fileTitle->equals( $title ) ) {
						return true;
					}
				}
			}
			return false;
		}
		return false;
	}

}
