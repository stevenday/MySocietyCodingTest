/*********************************
 * Variables
 ********************************/

// Holder for our global objects
window.mysociety = {};

// Init global objects
mysociety.votes = {};
mysociety.chart = {};

// Map of party name to data series index in the chart
mysociety.chartPartyIndex = {
    conservative: 0,
    labour: 1,
    libdem: 2,
    ukip: 3,
    green: 4,
    novote: 5
};

// Show "UK" data initially
mysociety.currentConstituency = "uk";

/*********************************
 * Helper functions
 ********************************/

// Simple number rounder - works give or take some floating point issues
// From: http://forums.devarticles.com/javascript-development-22/javascript-to-round-to-2-decimal-places-36190.html
function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

// Capitalise the first letter of a string
// From: http://stackoverflow.com/questions/2017456/with-jquery-how-do-i-capitalize-the-first-letter-of-a-text-field-while-the-user
String.prototype.capitalise = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Update the chart with new votes
function updateChart() {
    var votes = mysociety.votes[mysociety.currentConstituency];
    // Votes might not have been passed
    if(typeof votes === 'undefined') {
        votes = {
            conservative: 0,
            labour: 0,
            libdem: 0,
            ukip: 0,
            green: 0,
            novote: 0
        };
    }
    var i = 0;
    var total = 0;
    for (party in votes) {
        mysociety.chart.series[0].data[mysociety.chartPartyIndex[party]].update(votes[party]);
        i++;
        total += votes[party];
    }
    $('#total-count').html(total);
}

// Populate the global data object with vote totals, keyed by constituency name
function populateVotesData(data) {
    mysociety.votes = {};
    for (result in data) {
        mysociety.votes[data[result].constituency] = data[result].votes;
    }
}

// Switch the constituency which is displayed
function switchConstituency(constituency) {
    mysociety.currentConstituency = constituency;
    mysociety.chart.setTitle({
        text: constituency.capitalise() + " Votes"
    });
    updateChart();
}

/*********************************
 * The App
 ********************************/

$(document).ready(function () {
    // Connect to the websocket
    var socket = io.connect('http://localhost:3000');
    socket.on('votes', function (data) {
        populateVotesData(data);
        updateChart();
    });

    // The pie chart
    mysociety.chart = new Highcharts.Chart({
        chart: {
            renderTo: 'pie-chart',
            defaultSeriesType: 'pie'
        },
        tooltip: {
            enabled: false
        },
        title: {
            text: 'UK Votes'
        },
        plotOptions: {
            pie: {
                allowPointSelect: false,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    formatter: function () {
                        return '<b>' + this.point.name + '</b>: ' + roundNumber(this.percentage, 2) + ' %';
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'UK Votes',
            data: [{
                name: 'Conservative',
                y: 0,
                color: '#0087DC'
            }, {
                name: 'Labour',
                y: 0,
                color: '#DC241F'
            }, {
                name: 'Liberal Democrat',
                y: 0,
                color: '#FDBB30'
            }, {
                name: 'UKIP',
                y: 0,
                color: '#70147A'
            }, {
                name: 'Green',
                y: 0,
                color: '#99CC33'
            }, {
                name: 'Did not vote',
                y: 0,
                color: '#CCCCCC',
                sliced: true
            }]
        }]
    });

    // Form submissions
    $('#vote-form').ajaxForm({
        success: function (responseText, statusText, xhr, $form) {
            alert("Thank you for Voting!");
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("Something went wrong with your vote: " + errorThrown);
        }
    });

    // Menu ajaxifying
    $(".menuitem > a").click(function (e) {
        // Switch to showing selected constituency
        switchConstituency($(this).attr('id'));
        e.preventDefault();
        return false;
    });

});