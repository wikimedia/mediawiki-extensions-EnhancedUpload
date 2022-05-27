<?php

namespace MediaWiki\Extension\EnhancedUpload\Test;

use MediaWiki\Extension\EnhancedUpload\AttachmentTagModifier;
use PHPUnit\Framework\TestCase;

class AttachmentTagModifierTest extends TestCase {
	public const WIKITEXT1 =
'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:DEF.pdf]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
</attachments>';

public const WIKITEXT2 =
'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:DEF.pdf]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
</attachments>';

public const WIKITEXT3 =
'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:DEF.pdf]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
</attachments>';

public const WIKITEXT1EXP = 'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:DEF.pdf]]
* [[Media:GHI.docx]]
* [[Media:FileTest.pdf]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
</attachments>';

public const WIKITEXT2EXP = 'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:DEF.pdf]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
* [[Media:FileTest1.pdf]]
* [[Media:FileTest2.pdf]]
* [[Media:FileTest3.pdf]]
</attachments>';

public const WIKITEXT3REXP = 'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:DEF.pdf]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
</attachments>';

public const WIKITEXT1REXP = 'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
</attachments>';

public const WIKITEXT2REXP = 'Test

[[:Datei:Upload Test 24.txt|Datei:Upload Test 24.txt]]

=== ACB ===

<attachments title="DropZone">
* [[Media:ABC.png]]
* [[Media:GHI.docx]]
</attachments>
Test Test
<attachments>
* [[Media:XZY.docx]]
</attachments>';

public const WIKITEXTREMOVETEST = '
[[Medium:Upload Test 1649830505569.txt|Upload Test 1649830505569.txt]]


<attachments>
* [[Media:Test8.txt]]
* [[Media:Test50.txt]]
* [[Media:Breadcrumbs Cases.txt]]
</attachments>
[[Medium:Attachments 1649856046031.txt|Attachments 1649856046031.txt]]



[[Medium:Attachments 1649841937276.txt|Datei:Attachments 1649841937276.txt]]

Test';

public const WIKITEXTREMOVETESTEXP = '
[[Medium:Upload Test 1649830505569.txt|Upload Test 1649830505569.txt]]


<attachments>
* [[Media:Test8.txt]]
* [[Media:Test50.txt]]
</attachments>
[[Medium:Attachments 1649856046031.txt|Attachments 1649856046031.txt]]



[[Medium:Attachments 1649841937276.txt|Datei:Attachments 1649841937276.txt]]

Test';

	/**
	 *
	 * @covers \EnhancedUpload\AttachmentTagModifier::add
	 */
	public function testAdd() {
		$modifier = new AttachmentTagModifier();

		$modifiedWikiText = $modifier->add( static::WIKITEXT1, 0, [ 'FileTest.pdf' ] );
		$this->assertEquals( static::WIKITEXT1EXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->add( static::WIKITEXT2, 1, [ 'FileTest1.pdf','FileTest2.pdf','FileTest3.pdf' ] );
		$this->assertEquals( static::WIKITEXT2EXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->add( static::WIKITEXT1, 3, [ 'FileTest1.pdf','FileTest2.pdf','FileTest3.pdf' ] );
		$this->assertEquals( static::WIKITEXT3REXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->add( static::WIKITEXT1, 0, [] );
		$this->assertEquals( static::WIKITEXT3REXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->add( static::WIKITEXT3, 1, [ 'XZY.docx' ] );
		$this->assertEquals( static::WIKITEXT3REXP, $modifiedWikiText );
	}

	/**
	 *
	 * @covers \EnhancedUpload\AttachmentTagModifier::remove
	 */
	public function testRemove() {
		$modifier = new AttachmentTagModifier();

		$modifiedWikiText = $modifier->remove( static::WIKITEXT1, 0, [ 'DEF.pdf' ] );
		$this->assertEquals( static::WIKITEXT1REXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->remove( static::WIKITEXT1, 0, [ 'DEF.pdf', 'ABC.png' ] );
		$this->assertEquals( static::WIKITEXT2REXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->remove( static::WIKITEXT1, 1, [ 'DEF.pdf', 'ABC.png' ] );
		$this->assertEquals( static::WIKITEXT3REXP, $modifiedWikiText );

		$modifiedWikiText = $modifier->remove( static::WIKITEXTREMOVETEST, 0, [ 'Breadcrumbs_Cases.txt' ] );
		$this->assertEquals( static::WIKITEXTREMOVETESTEXP, $modifiedWikiText );
	}

}
