var assert = require("assert");
var CRDT = require("../index.js");



let crdt = CRDT( "TEST STRING" );
//crdt.split( 2 );
//console.log( crdt.toSomething( ) );

crdt.insert( 2 , "W" );
console.log( crdt.toSomething( ) );
//crdt.split( 3 );
crdt.insert( 7 , "X" );
console.log( crdt.toSomething( ) );
crdt.insert( 8 , "Y" );
console.log( crdt.toSomething( ) );
crdt.insert( 9 , "Z" );
console.log( crdt.toSomething( ) );

console.log( crdt.toString( ) );
 