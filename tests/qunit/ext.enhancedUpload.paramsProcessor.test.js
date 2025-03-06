( function () {
	QUnit.module( 'ext.enhancedUpload.paramsProcessor.test', QUnit.newMwEnvironment() );

	const tests = [
		[
			{
				prefix: 'ABC',
				filename: 'Test.txt',
				format: 'txt',
				ignorewarnings: true,
				comment: 'TestComment'
			},
			{
				name: 'Test.txt'
			}
		],
		[
			{
				prefix: 'ABC:',
				filename: 'Test.txt',
				format: 'txt',
				ignorewarnings: true,
				comment: 'TestComment'
			},
			{
				name: 'Test.txt'
			}
		],
		[
			{
				prefix: 'ABC:DEF',
				filename: 'Test.txt',
				format: 'txt',
				ignorewarnings: true,
				comment: 'TestComment'
			},
			{
				name: 'Test.txt'
			}
		],
		[
			{
				prefix: 'ABC:DEF:',
				filename: 'Test.txt',
				format: 'txt',
				ignorewarnings: true,
				comment: 'TestComment'
			},
			{
				name: 'Test.txt'
			}
		]
	];
	const expectedParams = [
		{
			filename: 'ABCTest.txt',
			format: 'txt',
			ignorewarnings: true,
			comment: 'TestComment',
			prefix: 'ABC'
		},
		{
			filename: 'ABC_Test.txt',
			format: 'txt',
			ignorewarnings: true,
			comment: 'TestComment',
			prefix: 'ABC:'
		},
		{
			filename: 'ABC_DEFTest.txt',
			format: 'txt',
			ignorewarnings: true,
			comment: 'TestComment',
			prefix: 'ABC:DEF'
		},
		{
			filename: 'ABC_DEF_Test.txt',
			format: 'txt',
			ignorewarnings: true,
			comment: 'TestComment',
			prefix: 'ABC:DEF:'
		}
	];

	QUnit.test( 'ext.enhancedUpload.paramsProcessor.test', ( assert ) => {
		for ( let i = 0; i < 4; i++ ) {
			const processor = new enhancedUpload.ParamsProcessor();
			const retrievedParams = processor.getParams( tests[ i ][ 0 ], tests[ i ][ 1 ], true );
			assert.deepEqual( retrievedParams, expectedParams[ i ], 'params' );
		}
	} );

}() );
