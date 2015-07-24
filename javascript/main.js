/*global requirejs:true*/
'use strict';

requirejs.config({
    // i've got more stuff coming from CDN than not
    paths: {
        'lib': 'https://cdnjs.cloudflare.com/ajax/libs/'
    },
    map: {
        '*': {
            'moment': 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment.min.js',
            'async': 'lib/requirejs-plugins/1.0.3/async.min',
            'propertyParser': 'lib/requirejs-plugins/1.0.3/propertyParser.min',
            'goog': 'lib/requirejs-plugins/1.0.3/goog.min',
            'json': 'lib/requirejs-plugins/1.0.3/json.min',
            'text': 'lib/require-text/2.0.12/text.min',
        }
    }
});

requirejs(
    [
        'json!../data.json',
        'moment',
        'goog!visualization,1,packages:[corechart]'
    ],
    // google doesn't have AMD so we need to access it via window.google
    function (raw_data, moment) {
        var points = formatData(raw_data);
        var data = new window.google.visualization.DataTable();
        var DAYS_EITHER_SIDE = 10;

        function formatData(raw_data) {
            var data = raw_data.point.map(function(point) {
                // get it out of nanoseconds
                var val = point.value[0].fpVal;

                // start time is in nanos, date accepts timestamps in millis, so convert for tat
                var time = new Date(+point.startTimeNanos / 1e6);
                return [time, val];
            });
            return data.sort(function(a, b) {
                return a[0] - b[0];
            });
        }

        function getMinDate(points) {
            return moment(points[0][0]).subtract(DAYS_EITHER_SIDE, 'days').toDate();
        }
        function getMaxDate(points) {
            return moment(points.slice(-1)[0][0]).add(DAYS_EITHER_SIDE, 'days').toDate();
        }

        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'Weight');
        data.addRows(points);

        // Set chart options
        var options = {
            title: 'Weight',
            vAxis: {
                title: 'Weight (kg)'
            },
            hAxis: {
                title: 'Date',
                gridlines: {count: -1},
                viewWindowMode: 'explicit',
                viewWindow: {
                    // dates are zero indexed just because
                    min: getMinDate(points),
                    max: getMaxDate(points),
                },
            },
            trendlines: {
                0: {
                    // type: 'polynomial',
                    // degree: 2,
                    lineWidth: 5,
                    opacity: 0.5,
                    color: 'green',
                }
            },
            legend: {position: 'none'},
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new window.google.visualization.ScatterChart(
            document.getElementById('chart_div')
        );
        chart.draw(data, options);
});
