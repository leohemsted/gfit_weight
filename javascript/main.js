/*global requirejs:true*/
'use strict';

requirejs.config({
    // i've got more stuff coming from CDN than not
    baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/',
    paths: {
        // require.js google plugin
        'async': 'requirejs-plugins/1.0.3/async.min',
        'propertyParser': 'requirejs-plugins/1.0.3/propertyParser.min',
        'goog': 'requirejs-plugins/1.0.3/goog.min',
        'json': 'require-text/2.0.12/text.min'
    },
});

requirejs(
    ['goog!visualization,1,packages:[corechart]'],
    function () {
        var data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([
            ['Mushrooms', 3],
            ['Onions', 1],
            ['Olives', 1],
            ['Zucchini', 1],
            ['Pepperoni', 2]
        ]);

        // Set chart options
        var options = {
            'title': 'How Much Pizza I Ate Last Night',
            'width': 400,
            'height': 300
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new window.google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
});
