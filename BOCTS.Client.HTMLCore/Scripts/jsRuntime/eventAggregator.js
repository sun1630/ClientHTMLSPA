define(['durandal/events'], function (event) {
    var aggregator = {};
    event.includeIn(aggregator);
    return aggregator;
});