<?php

namespace MediaWiki\Extension\EnhancedUpload\HookHandler;

use FormatJson;
use Html;
use MediaWiki\Hook\ParserFirstCallInitHook;
use Parser;
use PPFrame;
use Sanitizer;
use Title;
use TitleFactory;

class Tag implements ParserFirstCallInitHook {
	public const NAME = 'attachments';

	/**
	 * @var TitleFactory
	 */
	private $titleFactory;

	/**
	 *
	 * @var int
	 */
	private static $counter = 0;

	/**
	 * @param TitleFactory $titleFactory
	 */
	public function __construct( TitleFactory $titleFactory ) {
		$this->titleFactory = $titleFactory;
	}

	/**
	 * @param Parser $parser
	 */
	public function onParserFirstCallInit( $parser ) {
		$parser->setHook( static::NAME, [ $this, 'onFileList' ] );
	}

	/**
	 * @param string $input
	 * @param array $args
	 * @param Parser $parser
	 * @param PPFrame $frame
	 * @return array
	 */
	public function onFilelist( string $input, array $args, Parser $parser,
		PPFrame $frame ) {
		$parser->getOutput()->addModuleStyles( [ 'ext.enhancedupload.attachments.styles' ] );
		$parser->getOutput()->addModules( [ 'ext.enhancedupload.attachments.bootstrap' ] );

		$files = [];
		$tagTitle = '';
		$tagPrefix = '';
		$tagCategories = '';
		$tagDescription = '';
		$tagSkipOptions = false;
		$tagHideVersion = false;
		$tagHideEditor = false;
		$tagShowSize = false;
		$tagShowCategories = false;

		if ( isset( $args[ 'title' ] ) ) {
			$tagTitle = $args[ 'title' ];
		}
		if ( isset( $args[ 'prefix' ] ) ) {
			$tagPrefix = $args[ 'prefix' ];
		}
		if ( isset( $args[ 'categories' ] ) ) {
			$tagCategories = $args[ 'categories' ];
		}
		if ( isset( $args[ 'description' ] ) ) {
			$tagDescription = $args[ 'description' ];
		}
		if ( isset( $args[ 'skipoptions' ] ) ) {
			$tagSkipOptions = $args[ 'skipoptions' ];
		}
		if ( isset( $args[ 'hideversion' ] ) ) {
			$tagHideVersion = $args[ 'hideversion' ];
		}
		if ( isset( $args[ 'hideeditor' ] ) ) {
			$tagHideEditor = $args[ 'hideeditor' ];
		}
		if ( isset( $args[ 'showsize' ] ) ) {
			$tagShowSize = $args[ 'showsize' ];
		}
		if ( isset( $args[ 'showcategories' ] ) ) {
			$tagShowCategories = $args[ 'showcategories' ];
		}

		foreach ( $this->getFilesFromWikiText( $input ) as $title ) {
			$files[] = $title->getDBkey();
		}
		$count = static::$counter++;

		$out = Html::openElement( 'div', [
			'class' => 'attachments-filelist loading',
			// get the actual title, as this could have been embedded by a template
			'data-frametitle' => $frame->getTitle()->getArticleID(),
			'data-no' => $count,
			'data-files' => FormatJson::encode( $files ),
			'data-title' => $tagTitle,
			'data-prefix' => $tagPrefix,
			'data-categories' => $tagCategories,
			'data-description' => $tagDescription,
			'data-skip-options' => $tagSkipOptions,
			'data-hideversion' => $tagHideVersion,
			'data-hideeditor' => $tagHideEditor,
			'data-showsize' => $tagShowSize,
			'data-showcategories' => $tagShowCategories
		] );
		$out .= $parser->recursiveTagParseFully( $input, $frame );
		$out .= Html::element( 'div', [
			'class' => 'attachments-loader',
			'id' => 'loader-' . $count
		] );

		$out .= Html::closeElement( 'div' );
		return $out;
	}

	/**
	 * @param string $wikitext
	 * @return Title[]
	 */
	private function getFilesFromWikiText( $wikitext ): array {
		$titles = [];
		$tags = preg_match_all(
			"#\[\[(.*?)\]\]#is",
			$wikitext,
			$matches
		);
		if ( $tags ) {
			foreach ( $matches[1] as $match ) {
				$title = $this->getTitle( $match );
				$titles[] = $title;
			}
		}
		return $titles;
	}

	/**
	 * @param string $text
	 * @return title
	 */
	private function getTitle( string $text ): title {
		$linkParts = explode( '|', $text );
		$titleParts = explode( ':', $linkParts[ 0 ], 2 );
		$titleText = trim( $titleParts[ 1 ] );
		$sanitizedText = Sanitizer::decodeCharReferences( $titleText );
		$title = $this->titleFactory->makeTitle( NS_MEDIA, $sanitizedText );
		return $title;
	}

}
