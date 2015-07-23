/*global requirejs:true*/
'use strict';

var REQJS_PLUGINS = 'https://cdnjs.cloudflare.com/ajax/libs/requirejs-plugins/1.0.3/';

requirejs.config({
    baseUrl: 'javascript',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        // require.js google plugin
        'async': REQJS_PLUGINS +'async.min',
        'propertyParser': REQJS_PLUGINS + 'propertyParser.min',
        'goog': REQJS_PLUGINS +'goog.min'
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
            'title':'How Much Pizza I Ate Last Night',
            'width':400,
            'height':300
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new window.google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
});
