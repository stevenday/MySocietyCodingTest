/*******************************
 * Configuration
 ******************************/

// Connection string
var dbConnectionString = "mongodb://localhost/elections";

/*******************************
 * Required modules
 ******************************/

//Mongoose for MongoDB ORM
var mongoose = require('mongoose');

/*******************************
 * Database
 ******************************/

// Connect to the db
mongoose.connect(dbConnectionString);

// Define our Schemas
var Schema = mongoose.Schema;

// Schema for keeping track of vote totals
var VoteTotals = new Schema({
    constituency: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    votes: {
        conservative: Number,
        labour: Number,
        libdem: Number,
        ukip: Number,
        green: Number,
        novote: Number
    }
});

// Define increment() so that we can do that super quick
VoteTotals.statics.increment = function (constituency, party, callback) {
    var inc = {};
    inc['votes.' + party] = 1;
    return this.collection.update({
        'constituency': constituency
    }, {
        $inc: inc
    }, {
        upsert: true
    }, callback);
};

// Schema for keeping track of actual votes
var Vote = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    constituency: {
        type: String,
        required: true,
        index: true
    },
    party: {
        type: String,
        required: true,
        index: true
    }
});

// Define some middleware to increment vote counters when votes are saved
// In each, "this" is the document about to be saved

// Update the constituency counter
Vote.pre('save', function (next) {
    VoteTotals.increment(this.constituency, this.party, next);
});
// Update the uk counter
Vote.pre('save', function (next) {
    VoteTotals.increment("uk", this.party, next);
});

// Initialise the schemas
mongoose.model('Vote', Vote);
var Vote = mongoose.model('Vote');

mongoose.model('VoteTotals', VoteTotals);
var VoteTotals = mongoose.model('VoteTotals');

/*******************************
 * Exported functions
 ******************************/

// Return the current votes for every constituency to the callback
function getCurrentVotes(callback) {
    // Return all documents in VoteTotals schema
    VoteTotals.find({}, function (err, totals) {
        callback(err, totals);
    });
}

// Save a vote into the db and update the totals
function saveVote(voteToSave, callback) {
    // Try to put the vote into the Vote schema
    var vote = new Vote(voteToSave);
    vote.save(function (err) {
        callback(err);
    });
}

exports.getCurrentVotes = getCurrentVotes;
exports.saveVote = saveVote;