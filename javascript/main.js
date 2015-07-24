/*global requirejs:true*/
'use strict';

requirejs.config({
    // i've got more stuff coming from CDN than not
    paths: {
        'lib': 'https://cdnjs.cloudflare.com/ajax/libs/'
    },
    map: {
        '*': {
            'async': 'lib/requirejs-plugins/1.0.3/async.min',
            'propertyParser': 'lib/requirejs-plugins/1.0.3/propertyParser.min',
            'goog': 'lib/requirejs-plugins/1.0.3/goog.min',
            'json': 'lib/requirejs-plugins/1.0.3/json.min',
            'text': 'lib/require-text/2.0.12/text.min'
        }
    }
});

function format_data(raw_data) {
    var data = raw_data.point.map(function(point) {
        // get it out of nanoseconds
        var val = point.value[0].fpVal;

        // start time is in nanos, date accepts timestamps in millis, so convert for tat
        var time = new Date(+point.startTimeNanos / 1e6);
        return [time, val];
    });
    data.sort(function(a, b) {
        return a[0] < b[0];
    })
    return data;
}

requirejs(
    [
        'json!../data.json',
        'goog!visualization,1,packages:[corechart]'
    ],
    // google doesn't have AMD so we need to access it via window.google
    function (raw_data) {
        var points = format_data(raw_data);
        var data = new window.google.visualization.DataTable();
        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'Weight');
        data.addRows(points);

        // Set chart options
        var options = {
            title: 'Leos Weight',
            vAxis: {
                title: 'Weight (kg)'
            },
            hAxis: {
                title: 'Date',
                formatType: 'short',
                gridlines: {count: -1}
            },
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new window.google.visualization.ScatterChart(
            document.getElementById('chart_div')
        );
        chart.draw(data, options);
});
