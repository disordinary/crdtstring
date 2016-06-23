var assert = require("assert");
var CRDT = require("../index.js");




describe( "CRDT insertion and deletion tests" , ( ) => {
	
		
		it('The CRDT should insert in a predictable and logical fashion', ( done ) => {


			let testString = "TEST STRING";
			let crdt = CRDT( testString );


			crdt.insert( 2 , "W" );
			testString = stringSplice( testString , 2 , 0 , "W" );

			crdt.insert( 7 , "X" );
			testString = stringSplice( testString , 7 , 0 , "X" );

			crdt.insert( 8 , "Y" );
			testString = stringSplice( testString , 8 , 0 , "Y" );

			crdt.insert( 9 , "Z" );
			testString = stringSplice( testString , 9 , 0 , "Z" );

			crdt.insert( 8 , "#" );
			testString = stringSplice( testString , 8 , 0 , "#" );

			crdt.insert( 0 , "A" );
			testString = stringSplice( testString , 0 , 0 , "A" );

			crdt.insert( crdt.length, "Z" );
			testString = stringSplice( testString , testString.length , 0 , "Z" );

			assert.equal( crdt.toString( ) , testString );
			done( );
			 
		} );

		it( 'The CRDT should delete in a predictable and logical fashion' , ( done ) => {
			let testString = "TEST STRING";
			let crdt = CRDT( testString );

			crdt.delete( 2 , 3 );
			testString = stringSplice( testString , 2 , 3 );
			assert.equal( crdt.toString( ) , testString );
			done();
		} );

		it( 'should survive a stress test' , ( done ) => {

			let testString = "TEST STRING";
			let crdt = CRDT( testString );

			for( let i = 0; i < 10000; i++ ) {
				let insert = Math.floor( Math.random(  ) * 2 );
				let character = Math.random().toString(36).substr(3 , 1);
				let position = Math.floor( Math.random( ) * crdt.length );
				let length = Math.floor( Math.random( ) * 10 );
				if( insert ) {
					crdt.insert( position , character );
					testString = stringSplice( testString , position , 0 , character );
				} else {
					if( length == 0 || position ==0) break;
					crdt.delete( position  , length  );
					testString = stringSplice( testString , position , length );

				}

			}
			assert.equal( crdt.toString( ) , testString );

			//
			
		//	console.log( crdt.toId( ) );
			done();
		} );

	});
describe( 'synchronisation' , ( ) => {
	it( 'two CRDT strings should remain in sync with replays ' , ( done ) => {
		done();
	});

	it( 'if two concurrent operations occur the CRDT should maintain intention' , ( done ) => {
		done();
	});
});

describe( 'events' , ( ) => {
	it( 'should recieve events' , ( done ) => {
			let testString = "TEST STRING";
			let crdt = CRDT( testString );
			
			let sentCount =0;
			crdt.onChange( ( e ) => {
				sentCount--;
				if( sentCount == 0 ) {
					assert.equal( 1 , 1 );
					done();
				}
			});

			for( let i = 0; i < 1000; i++ ) {
				let insert = Math.floor( Math.random(  ) * 2 );
				let character = Math.random().toString(36).substr(3 , 1);
				let position = Math.floor( Math.random( ) * crdt.length );
				let length = Math.floor( Math.random( ) * 10 );
				if( insert ) {
					crdt.insert( position , character );
					testString = stringSplice( testString , position , 0 , character );
					sentCount++;
				} else {
					if( length == 0 || position ==0) break;
					sentCount++;
					crdt.delete( position  , length  );
					testString = stringSplice( testString , position , length );

				}

			}

			
	} );
} );
 //
 //crdt.splitAtId( 7 );
 //
 //
 function stringSplice( str , start , delcount , newstr ) {
 	newstr = newstr || "";
 	return str.slice( 0 , start ) + newstr + str.slice( start + delcount );
 }