/*****************************************************************************
 * MongoDB Shell script
 * 
 * A live-action replay (sort of) of the 2010 General election.
 * 
 * Only updates the uk-wide counters, doesn't actually insert millions of votes
 * into your database!
 ****************************************************************************/

/*****************************
 * Variables
 ****************************/

// Total votes per party
// Data from http://en.wikipedia.org/wiki/United_Kingdom_general_election,_2010#Results
var total_votes_per_party = {
    conservative: 10703654,
    labour: 8606517,
    libdem: 6836248,
    ukip: 919471,
    green: 265243,
    novote: 16054000 // 65.1% turnout, 46 million eligible voters
};

// Running total of the votes cast
var total_votes_cast = 0;

// Var to contain the voting interval timer
var voting = null;

// Default increment multiplier, to speed things up a bit
var multiplier = 100;

/*****************************
 * Helper Functions
 ****************************/

// Function to increment the votes for each party
// Takes the vote ratio and multiplies it to add some votes to the party in a
// sort of realistic fashion.
function vote() {
    for (party in total_votes_per_party) {
        if (total_votes_per_party[party] > 0) {
            // Calculate the increment for this party
            var increment = Math.round(multiplier * Math.random());
            // Vote and then remove those votes from the counters
            var votes_left = total_votes_per_party[party];
            var votes_to_cast = (votes_left > increment) ? increment : votes_left;
            var inc = {};
            inc['votes.' + party] = votes_to_cast;
            db.votetotals.update({
                constituency: "uk"
            }, {
                $inc: inc
            }, {
                upsert: true
            }, {});
            total_votes_per_party[party] = votes_left - votes_to_cast;
        }
    }
}

//Function to check if there are more votes to cast, and if not,
//close the polls
function finishedVoting() {
    var allFinished = true;
    for (party in total_votes_per_party) {
        if (total_votes_per_party[party] > 0) {
            allFinished = false;
        }
    }
    return allFinished;
}

/***************************
 * Script
 **************************/

// Ensure Indexes
db.votetotals.ensureIndex({constituency: 1},{unique:true, required:true});

// Cycle through votes
while (!finishedVoting()) {
    vote();
}