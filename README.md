MySociety Elections Challenge
===========================

Submission for My Society's developer position coding challenge.

My submission uses node.js, MongoDB and Socket.io to create a live-updating app
where you can submit your vote, and a pie-chart updates continually to show the
votes as they come in. Votes are stored in the database, along with running 
totals for each of the parties in each of the constituencies and across the 
whole country.

I've run this on Windows 7 (64bit) and tested it in the latest Chrome and 
Firefox browsers. It should be able to run equally well under Linux or Mac, and
in other browsers too, but I didn't have time to check.

Limitations
-----------
I've intentionally limited the constituencies to 3, and the parties available
are fixed and the same for each. This was to make the interface and database
simpler and to save time. There is also minimal effort to avoid voting fraud, 
you just need to supply a unique-looking email address for each vote.

Required Software
-----------------

* Node.js server
* MongoDB database server running at localhost with no username or password

Installation
------------

Assuming you already have the required software setup, all you need to do is 
clone the repository, and then on the command-line, cd to the project directory 
and type:

```node server.js```

To run the server.

Then navigate to: http://localhost:3000

Usage
-----

The pie chart shows the percentage of votes each party has received. You can 
submit a vote using the form below it. Only one vote per email address is 
allowed. The pie chart will update periodically to show the votes that are
coming in.

By default the page shows the total of all votes across all the constituencies.
To see votes for a specific constituency, click on one of the links at the top.

Optional Extra Demo
-------------------
I thought it would be fun to test it out with a simulation of the 2010 General
Election. Outside of my 4 hours I wrote ```actionreplay.js``` which is a MongoDB
shell script that randomly updates the vote counts for the UK until they match 
the real results for the parties in 2010.

To run this, first start the node server as above, and then in a separate
terminal, run the following command (or the linux/mac equivalent):

```C:\path_to_mongo\mongo.exe localhost:27017/elections --quiet C:\path_to_repo\MySocietyElectionsChallenge\actionreplay.js```

Then start your browser and navigate to: http://localhost:3000 to watch things
unfold.

It takes a few minutes to run through, you're looking for a number around 43
million in the ```Total``` to know it's done. 

Future Work
-----------
Obviously, 4 hours isn't particularly long to achieve a finished product, so 
there are plenty of things I'd like to do. In no particular order, these 
include:

* Write some unit and functional tests for the code
* Cross-browser test
* Extend the options to include all uk constituencies, perhaps with a postcode 
  lookup to find yours, or a map to select them from, or both
* Look at verifying the email before a vote is included, the user could be sent
  a one-time link which then moves their vote from ```pending_votes``` to the
  real ```votes``` table
* Extend the party list to include all parties that are actually in the 
  elections, and link them to the constituencies so that you only see those who
  actually have a candidate standing in a given constituency
* Improve the interface design
* Add more visualisation options: different graphs, a leaderboard, a map with
  each constituency coloured in the colour of the currently leading party
* Add the ability to see the uk-wide and constituency-level data side-by-side,
  so you can pick one or more constituencies and see them all together
