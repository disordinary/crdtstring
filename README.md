# crdtstring
A CRDT string manipulation library for concurrent editing.

Stores a CRDT as a double linked list. 

Offsets within a string is the ID of the object, insertions are given an index of a fraction of an offset. For instance:

`ABC` A = 0, B = 1, C = 2. If we insert something between B and C for instance `ABXC` A = 0, B = 1, X = 1.5, C = 2.

If we have two items with an offset of 1.5 then they are oredered based on timestamp.
