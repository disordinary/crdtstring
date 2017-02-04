var assert = require("assert");
var CRDT = require("../index.js");


describe("CRDT insertion and deletion tests", () => {


    it("The CRDT should insert in a predictable and logical fashion", (done) => {


        let testString = "TEST STRING";
        let crdt = CRDT(testString);


        crdt.insert(2, "W");
        testString = stringSplice(testString, 2, 0, "W");

        crdt.insert(7, "X");
        testString = stringSplice(testString, 7, 0, "X");

        crdt.insert(8, "Y");
        testString = stringSplice(testString, 8, 0, "Y");

        crdt.insert(9, "Z");
        testString = stringSplice(testString, 9, 0, "Z");

        crdt.insert(8, "#");
        testString = stringSplice(testString, 8, 0, "#");

        crdt.insert(0, "A");
        testString = stringSplice(testString, 0, 0, "A");

        crdt.insert(crdt.length, "Z");
        testString = stringSplice(testString, testString.length, 0, "Z");

        assert.equal(crdt.toString(), testString);
        done();

    });

    it("The CRDT should delete in a predictable and logical fashion", (done) => {
        let testString = "TEST STRING";
        let crdt = CRDT(testString);

        crdt.del(2, 3);
        testString = stringSplice(testString, 2, 3);
        assert.equal(crdt.toString(), testString);
        done();
    });

    it("should survive a stress test", (done) => {

        let testString = "TEST STRING";
        let crdt = CRDT(testString);

        for (let i = 0; i < 10000; i++) {
            let insert = Math.floor(Math.random() * 2);
            let character = Math.random().toString(36).substr(3, 1);
            let position = Math.floor(Math.random() * crdt.length);
            let length = Math.floor(Math.random() * 10);
            if (insert) {
                crdt.insert(position, character);
                testString = stringSplice(testString, position, 0, character);
            } else {
                if (length == 0 || position == 0) break;
                crdt.del(position, length);
                testString = stringSplice(testString, position, length);

            }

        }
        assert.equal(crdt.toString(), testString);

        //

        //	console.log( crdt.toId( ) );
        done();
    });

    it("should retain order even with very large strings", (done) => {


        let testString = "TEST STRING";
        let crdt = CRDT(testString);

        for (let i = 0; i < 30000; i++) { //this is approxomately a 6,000 word blog post
            let insert = Math.floor(Math.random() * 2);
            let character = Math.random().toString(36).substr(3, 1);
            let position = Math.floor(Math.random() * crdt.length);
            let length = Math.floor(Math.random() * 10);

            crdt.insert(position, character);
            testString = stringSplice(testString, position, 0, character);
        }

        assert.equal(crdt.toString(), testString);
        done();
    });

    it("should be reasonably performant at random inserts", (done) => {
        return done();

        let testString = "TEST STRING";
        let crdt = CRDT(testString);
        let start = Date.now();

        for (let i = 0; i < 30000; i++) { //this is approxomately a 6,000 word blog post
            let insert = Math.floor(Math.random() * 2);
            let character = Math.random().toString(36).substr(3, 1);
            let position = Math.floor(Math.random() * crdt.length);
            let length = Math.floor(Math.random() * 10);

            crdt.insert(position, character);
            //	testString = stringSplice( testString , position , 0 , character );
        }
        let crdtTime = Date.now() - start;

        start = Date.now();

        for (let i = 0; i < 30000; i++) { //this is approxomately a 6,000 word blog post
            let insert = Math.floor(Math.random() * 2);
            let character = Math.random().toString(36).substr(3, 1);
            let position = Math.floor(Math.random() * crdt.length);
            let length = Math.floor(Math.random() * 10);

            //	crdt.insert( position , character );
            testString = stringSplice(testString, position, 0, character);
        }

        let stringTime = Date.now() - start;
        console.log(crdtTime, stringTime);

        //assert.equal( crdt.toString( ) , testString );
    });

});
describe("synchronisation", () => {
    it("two CRDT strings should remain in sync with replays ", (done) => {
        done();
    });

    it("if two concurrent operations occur the CRDT should maintain intention", (done) => {
        done();
    });
});

describe("events", () => {
    it("should recieve events", (done) => {
        let testString = "TEST STRING";
        let crdt = CRDT(testString);

        let sentCount = 0;
        crdt.onChange((e) => {
            sentCount--;
            if (sentCount == 0) {
                assert.equal(1, 1);
                done();
            }
        });

        for (let i = 0; i < 1000; i++) {
            let insert = Math.floor(Math.random() * 2);
            let character = Math.random().toString(36).substr(3, 1);
            let position = Math.floor(Math.random() * crdt.length);
            let length = Math.floor(Math.random() * 10);
            if (insert) {
                crdt.insert(position, character);
                testString = stringSplice(testString, position, 0, character);
                sentCount++;
            } else {
                if (length == 0 || position == 0) break;
                sentCount++;
                crdt.del(position, length);
                testString = stringSplice(testString, position, length);
            }
        }
    });
});

describe("if inserted at the end then whole numbers should be used as an identifier TODO - if from one user these should merge", () => {
    let testString = "TEST STRING";
    let crdt = CRDT(testString);
    crdt.insert(3, "Y");
    crdt.insert(crdt.length, "X");
    crdt.insert(crdt.length, "X");
    crdt.insert(crdt.length, "X");
    it("adding items to the end of an array should make whole numbers ", (done) => {
        assert.equal(crdt.toId().join(), "1,4.5,5,13,14,15");
        done();
    });

});

describe("identifer tests", () => {
    it("should return an identifier ", (done) => {
        let testString = "TEST STRING";
        let crdt = CRDT(testString);
        console.log(crdt);

        console.log("IDENTIFIER", crdt.getIdentifier(3));
        done();
    });
});

describe("slice tests", () => {
    let testString = "THE QUICK BROWN FOX JUMPED AFTER THE LAZY DOG";
    let crdt = CRDT(testString);

    it('a slice should retain the same start and end identifiers reguardless of insertions and deletions', (done) => {
        let slice = crdt.getSlice(crdt.getIdentifier(5), crdt.getIdentifier(16));
        console.log(slice.toString());
        crdt.insert(11, "1");
        crdt.insert(12, "2");
        crdt.insert(13, "3");

        crdt.insert(15, "4");
        crdt.insert(16, "5");

        crdt.insert(3, "6");
        crdt.insert(2, "7");
        console.log(slice.toString());
        assert.equal(slice.toString(), "QU76ICK B123RO45WN");

    });

});

function stringSplice(str, start, delcount, newstr) {
    newstr = newstr || "";
    return str.slice(0, start) + newstr + str.slice(start + delcount);
}