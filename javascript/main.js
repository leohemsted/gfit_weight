/*global requirejs:true*/

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
        'use strict';
        var points = formatData(raw_data);
        var data = new window.google.visualization.DataTable();
        var dates = points.map(function(p){return p[0].toDate();});
        var weights = points.map(function(p){return p[1];});
        var avgs = rollingAverage(points);
        var minDate = getMinDate(points);
        var maxDate = getMaxDate(points);
        var DAYS_EITHER_SIDE = 10;

        function weightFormat(kg) {
            var lbs = kg * 2.20462;
            var st = Math.floor(lbs / 14);
            lbs = lbs % 14;
            return '' + st + 'st. ' + lbs.toFixed(1) + 'lb.';


        }

        function formatData(raw_data) {
            var data = raw_data.point.map(function(point) {
                // get it out of nanoseconds
                var val = point.value[0].fpVal;

                // start time is in nanos, date accepts timestamps in millis, so convert for tat
                var time = new Date(+point.startTimeNanos / 1e6);
                return [
                    moment(time),
                    {
                        v: val,
                        f: weightFormat(val)
                    }
                ];
            });
            return data.sort(function(a, b) {
                return a[0] - b[0];
            });
        }

        function rollingAverage(points) {
            var avgs = [];
            points.forEach(function(point){
                // using every for its shortcut functionality
                var startDate = point[0].clone().subtract(10, 'days');
                var avg = null;
                var nearbyPts = points.reduce(function(nearbyPts, altPt) {
                    var afterStart = altPt[0] >= startDate;
                    var beforeEnd = altPt[0] <= point[0];
                    // if it's within 10 days it's useful for rolling avg
                    if (afterStart && beforeEnd) {
                        nearbyPts.push(altPt[1].v);
                    }
                    return nearbyPts;
                }, []);
                avg = nearbyPts.length ? nearbyPts.reduce(function(accumulator, val) {
                    return accumulator + val;
                }, 0) / nearbyPts.length : null;
                // if there are no nearby pts be null

                avgs.push(avg);
            });
            return avgs;
        }

        function getMinDate(points) {
            return points[0][0].clone().subtract(DAYS_EITHER_SIDE, 'days');
        }
        function getMaxDate(points) {
            return points.slice(-1)[0][0].clone().add(DAYS_EITHER_SIDE, 'days');
        }
        data.addColumn('datetime', 'Date');
        data.addColumn('number', 'Weight');
        data.addColumn('number', 'rollingAvg');

        for (var i = 0; i < dates.length; i++) {
            data.addRow([dates[i], weights[i], avgs[i]]);
        }

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
                    min: minDate.toDate(),
                    max: maxDate.toDate(),
                },
            },
            series: {
                0: {
                    type: 'scatter'
                },
                1: {
                    type: 'line',
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
        var chart = new window.google.visualization.ComboChart(
            document.getElementById('chart_div')
        );
        chart.draw(data, options);
});
