// Bar
 /**
  * A Distributed Columns chart which display datas from one to multiple variables.
  * @param {number} id The container id where to display the chart
  */
  function Bar(id){
    
    /**
     * Just the active data series
     * @type {Array<object>}
     */
    var series = [],

    /**
     * List of variable keys (ids)
     * @type {Array<number>}
     */
    keys   = [],

    /**
     * List of all variable names
     * @type {Array<string>}
     */
    variable_names = [],

    /**
     * List of all variables
     * @type {Array<object>}
     */
    variables = {},

    /**
     * State used to know if the chart is prepared or not
     * @type {boolean}
     */
    prepared = false,

    /**
     * Chart container id - The HTML element where the chart is displayed
     * @type {number}
     */
    bar_container_id = '#chart-container-'+id,

    /**
     * Chart legend table id
     * @type {number}
     */
    legend_table_id = '#chart-legend-table-' + id,

    /**
     * Chart legend checkbox id - legend of checkbox, when checked will display the linked variable in the chart
     * @type {number}
     */
    legend_checkbox_id = '#chart-legend-checkbox-' + id + '-',

    /**
     * Chart legend checkbox status id - legend of checkbox status
     */
    legend_checkbox_status_id = '#chart-legend-checkbox-status-' + id + '-',

    /**
     * The object
     * @type {Bar}
     */
    plot = this;

    // init data 
    $.each($(legend_table_id + ' .variable-config'),function(key,val){
      val_inst = $(val);
      variable_name = val_inst.data('name');
      variable_key = val_inst.data('key');
      variables[variable_key] = {'color':val_inst.data('color'),'yaxis':1};      keys.push(variable_key);
      variable_names.push(variable_name);
      unit = "";
      label = "";
      // set label and unit text of each variable of the chart
      $.each($(legend_table_id + ' .legendSeries'),function(kkey,val){
          val_inst = $(val);
          if (variable_key == val_inst.find(".variable-config").data('key')){
              variables[variable_key].label = val_inst.find(".legendLabel").text().replace(/\s/g, '');
              variables[variable_key].unit = val_inst.find(".legendUnit").text().replace(/\s/g, '');
          }
      });
  });

    /**
     * Bar's options
     * @type {Array<object>}
     */
     var options = {
          series: [{
          data: []
        }],
          chart: {
          height: 350,
          type: 'bar',
          events: {
            click: function(chart, w, e) {
              // console.log(chart, w, e)
            }
          }
        },
        colors: [],
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              colors: [],
              fontSize: '12px'
            }
          }
        }
    };

    /**
     * The chart
     * @type {object}
     */
    var apexPlot = null;

    // public functions
    plot.update 			= update;
    plot.prepare 			= prepare;
    plot.resize 			= resize;

    // getter
    plot.getId				= function () {return id;};
    plot.getPrepared		= function () {return prepared;};
    plot.getFlotObject		= function () {return apexPlot;};
    
    plot.getSeries 			= function () { return series ;};
    plot.getKeys			= function (){ return keys;};
    plot.getVariableNames	= function (){ return variable_names;};

    plot.getInitStatus		= function () { if(InitDone){return InitRetry;}else{return false;}};
    plot.getId				= function () {return id;};
    plot.getBarContainerId= function () {return bar_container_id;};


    // prepare the chart and display it even without data
    function prepare(){
        // prepare legend table sorter
        if (keys.length > 0) {
            $(legend_table_id).tablesorter({sortList: [[2,0]]});
        }

        // add onchange function to every checkbox in legend / shows or hides the variable linked to the checked/unchecked checkbox
        $.each(variables,function(key,val){
            $(legend_checkbox_id+key).change(function() {
                plot.update(true);
                if ($(legend_checkbox_id+key).is(':checked')){
                    $(legend_checkbox_status_id+key).html(1);
                }else{
                    $(legend_checkbox_status_id+key).html(0);
                }
            });
        });
        // add onchange function to make_all_none checkbox in legend / shows or hides the chart's variables
        $(legend_checkbox_id+'make_all_none').change(function() {
            if ($(legend_checkbox_id+'make_all_none').is(':checked')){
                $.each(variables,function(key,val){
                    $(legend_checkbox_status_id+key).html(1);
                    $(legend_checkbox_id+key)[0].checked = true;
                });
            }else{
                $.each(variables,function(key,val){
                    $(legend_checkbox_status_id+key).html(0);
                    $(legend_checkbox_id+key)[0].checked = false;
                 });
            }
            plot.update(true);
        });


        // expand the pie to the maximum width
        main_chart_area = $(bar_container_id).closest('.main-chart-area');

        
        contentAreaHeight = main_chart_area.parent().height();
        mainChartAreaHeight = main_chart_area.height();

        // resize the main chart area if the content height exceed the main chart's
        if (contentAreaHeight>mainChartAreaHeight){
            main_chart_area.height(contentAreaHeight);
        }


        // Since CSS transforms use the top-left corner of the label as the transform origin,
        // we need to center the y-axis label by shifting it down by half its width.
        // Subtract 20 to factor the chart's bottom margin into the centering.
        var chartTitle = $(bar_container_id + ' .chartTitle');
        chartTitle.css("margin-left", -chartTitle.width() / 2);
        var xaxisLabel = $(bar_container_id + ' .axisLabel.xaxisLabel');
        xaxisLabel.css("margin-left", -xaxisLabel.width() / 2);
        var yaxisLabel = $(bar_container_id + ' .axisLabel.yaxisLabel');
        yaxisLabel.css("margin-top", yaxisLabel.width() / 2 - 20);

        // if we have data, then we display the bar chart
        if (series.length > -1) {
            apexPlot = new ApexCharts(document.querySelector(bar_container_id+' .chart-placeholder'),options);
            apexPlot.render();

            prepared = true;
            // update the plot
            update(false);
        }else {
            prepared = false;
        }
    }

    /**
     * Update the chart
     * @param {boolean} force Force the update despite the chart container not being visible
     * @returns void
     */
    function update(force){
        if(!prepared ){
            if($(bar_container_id).is(":visible")){
                prepared = true;
                prepare();
            }else{
                return;
            }
        }
        if(prepared && ($(bar_container_id).is(":visible") || force)){
            // only update if plot is visible
            // add the selected data series to the "series" variable
            old_series = series;
            new_data_bool = false;
            series = [];
            start_id = 0;

            for (var key in keys){
              key = keys[key];
              //console.log(apexPlot);
              if($(legend_checkbox_id+key).is(':checked') && typeof(DATA[key]) === 'object'){
               if (DATA_DISPLAY_TO_TIMESTAMP > 0 && DATA_DISPLAY_FROM_TIMESTAMP > 0){
                 start_id = find_index_sub_gte(DATA[key],DATA_DISPLAY_FROM_TIMESTAMP,0);
                 stop_id = find_index_sub_lte(DATA[key],DATA_DISPLAY_TO_TIMESTAMP,0);
             }else if (DATA_DISPLAY_FROM_TIMESTAMP > 0 && DATA_DISPLAY_TO_TIMESTAMP < 0){
                 start_id = find_index_sub_gte(DATA[key],DATA_DISPLAY_FROM_TIMESTAMP,0);
                 stop_id = find_index_sub_lte(DATA[key],DATA_TO_TIMESTAMP,0);
             }else if (DATA_DISPLAY_FROM_TIMESTAMP < 0 && DATA_DISPLAY_TO_TIMESTAMP > 0){
                 if (DATA_DISPLAY_TO_TIMESTAMP < DATA[key][0][0]){continue;}
                 start_id = find_index_sub_gte(DATA[key],DATA_FROM_TIMESTAMP,0);
                 stop_id = find_index_sub_lte(DATA[key],DATA_DISPLAY_TO_TIMESTAMP,0);
             }else {
                 start_id = find_index_sub_gte(DATA[key],DATA_FROM_TIMESTAMP,0);
                 stop_id = find_index_sub_lte(DATA[key],DATA_TO_TIMESTAMP,0);
             }
             if (typeof(start_id) == "undefined") {
                 continue;
             }else {
                 chart_data = DATA[key].slice(start_id,stop_id+1);
             }
             for (serie in old_series) {
               if (new_data_bool === false && chart_data.length > 0 && key === old_series[serie]['key'] && chart_data.length !== old_series[serie]['data'].length && (old_series[serie]['data'].length == 0 || chart_data[0][0] !== old_series[serie]['data'][0][0] || chart_data[0][1] !== old_series[serie]['data'][0][1] || chart_data[chart_data.length-1][0] !== old_series[serie]['data'][old_series[serie]['data'].length-1][0] && chart_data[chart_data.length-1][1] !== old_series[serie]['data'][old_series[serie]['data'].length-1][-1])) {
                 new_data_bool = true;
               }
             }
             series.push({"data":chart_data, "key":key, "label":variables[key].label,"unit":variables[key].unit, "color":variables[key].color});
             //series.push({"data":DATA[key][DATA[key].length - 1], "label":variables[key].label,"unit":variables[key].unit, "color":variables[key].color});
           }
          }
           if (new_data_bool || old_series.length == 0 || force) {

                if (typeof apexPlot !== 'undefined' && apexPlot !== null) {
                    // update flot plot
                    var dataBar = [];
                    var categorieNames = [];
                    var variablesColors = [];
                    for (var i = 0; i<series.length; i++){
                        const obj = {};
                        obj.x = series[i].label;
                        obj.y = {'x': series[i].label, 'y': series[i].data[1]};
                        obj.z = series[i].color;
                        categorieNames.push(obj.x);
                        dataBar.push(obj.y);
                        variablesColors.push(obj.z);
                    }
                    apexPlot.updateOptions({
                        series: [{
                         data: dataBar
                        }],
                        colors : variablesColors,
                        xaxis: {
                          categories: categorieNames,
                          labels:{
                            style: {
                              colors : variablesColors
                            }
                          }
                        }
                      });
                }
            }
        }
    }
    
    /**
     * Resize the chart when the navigator window dimension changed
     * @returns void
     */
    function resize() {
    }
}

// Line
/**
 * A Distributed Columns chart which display datas from one to multiple variables.
 * @param {number} id The container id where to display the chart
 */
 function Line(id){
   /**
    * Line's options
    * @type {Array<object>}
    */
    var options = {
      series: [{
      data: [null,null]
    }],
      chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false
      },
      animations: {
        enabled: false
      }
    },
    stroke: {
      width: 5,
      curve: 'straight'
    },
    labels: [],
    markers:{
      size: 0,
      hover: {
        size: 3,
        sizeOffset: 3
      }
     }
     };
   
   /**
    * Just the active data series
    * @type {Array<object>}
    */
   series = [],

   /**
    * List of variable keys (ids)
    * @type {Array<number>}
    */
   keys   = [],

   /**
    * List of all variable names
    * @type {Array<string>}
    */
   variable_names = [],

   /**
    * List of all variables
    * @type {Array<object>}
    */
   variables = {},

   /**
    * State used to know if the chart is prepared or not
    * @type {boolean}
    */
   prepared = false,

   /**
    * Chart container id - The HTML element where the chart is displayed
    * @type {number}
    */
   line_container_id = '#chart-container-'+id,

   /**
    * Chart legend table id
    * @type {number}
    */
   legend_table_id = '#chart-legend-table-' + id,

   /**
    * Chart legend checkbox id - legend of checkbox, when checked will display the linked variable in the chart
    * @type {number}
    */
   legend_checkbox_id = '#chart-legend-checkbox-' + id + '-',

   /**
    * Chart legend checkbox status id - legend of checkbox status
    */
   legend_checkbox_status_id = '#chart-legend-checkbox-status-' + id + '-',

   /**
    * The object
    * @type {Line}
    */
   plot = this;

   /**
    * The chart
    * @type {object}
    */
   var apexPlot = null;
   // public functions
   plot.update 			= update;
   plot.prepare 			= prepare;
   plot.resize 			= resize;

   // getter
   plot.getId				= function () {return id;};
   plot.getPrepared		= function () {return prepared;};
   plot.getFlotObject		= function () {return apexPlot;};
   
   plot.getSeries 			= function () { return series ;};
   plot.getKeys			= function (){ return keys;};
   plot.getVariableNames	= function (){ return variable_names;};

   plot.getInitStatus		= function () { if(InitDone){return InitRetry;}else{return false;}};
   plot.getId				= function () {return id;};
   plot.getBarContainerId= function () {return line_container_id;};


   // init data 
   $.each($(legend_table_id + ' .variable-config'),function(key,val){
    val_inst = $(val);
       variable_name = val_inst.data('name');
       variable_key = val_inst.data('key');
       variables[variable_key] = {'color':val_inst.data('color'),'yaxis':1};
       keys.push(variable_key);
       variable_names.push(variable_name);
       unit = "";
       label = "";
       // set label and unit text of each variable of the chart
       $.each($(legend_table_id + ' .legendSeries'),function(kkey,val){
           val_inst = $(val);
           if (variable_key == val_inst.find(".variable-config").data('key')){
               variables[variable_key].label = val_inst.find(".legendLabel").text().replace(/\s/g, '');
               variables[variable_key].unit = val_inst.find(".legendUnit").text().replace(/\s/g, '');
           }
       });
   });

   // prepare the chart and display it even without data
   function prepare(){

       // prepare legend table sorter
       if (keys.length > 0) {
           $(legend_table_id).tablesorter({sortList: [[2,0]]});
       }

       // add onchange function to every checkbox in legend / shows or hides the variable linked to the checked/unchecked checkbox
       $.each(variables,function(key,val){
           $(legend_checkbox_id+key).change(function() {
               plot.update(true);
               if ($(legend_checkbox_id+key).is(':checked')){
                   $(legend_checkbox_status_id+key).html(1);
               }else{
                   $(legend_checkbox_status_id+key).html(0);
               }
           });
       });
       // add onchange function to make_all_none checkbox in legend / shows or hides the chart's variables
       $(legend_checkbox_id+'make_all_none').change(function() {
           if ($(legend_checkbox_id+'make_all_none').is(':checked')){
               $.each(variables,function(key,val){
                   $(legend_checkbox_status_id+key).html(1);
                   $(legend_checkbox_id+key)[0].checked = true;
               });
           }else{
               $.each(variables,function(key,val){
                   console.log(legend_checkbox_status_id+key);
                   $(legend_checkbox_status_id+key).html(0);
                   $(legend_checkbox_id+key)[0].checked = false;
                });
           }
           plot.update(true);
       });


       // expand the pie to the maximum width
       main_chart_area = $(line_container_id).closest('.main-chart-area');

       
       contentAreaHeight = main_chart_area.parent().height();
       mainChartAreaHeight = main_chart_area.height();

       // resize the main chart area if the content height exceed the main chart's
       if (contentAreaHeight>mainChartAreaHeight){
           main_chart_area.height(contentAreaHeight);
       }


       // Since CSS transforms use the top-left corner of the label as the transform origin,
       // we need to center the y-axis label by shifting it down by half its width.
       // Subtract 20 to factor the chart's bottom margin into the centering.
       var chartTitle = $(line_container_id + ' .chartTitle');
       chartTitle.css("margin-left", -chartTitle.width() / 2);
       var xaxisLabel = $(line_container_id + ' .axisLabel.xaxisLabel');
       xaxisLabel.css("margin-left", -xaxisLabel.width() / 2);
       var yaxisLabel = $(line_container_id + ' .axisLabel.yaxisLabel');
       yaxisLabel.css("margin-top", yaxisLabel.width() / 2 - 20);

       // if we have data, then we display the bar chart
       if (series.length > -1) {
           console.log(line_container_id+' .chart-placeholder');
           apexPlot = new ApexCharts(document.querySelector(line_container_id+' .chart-placeholder'),options);
           apexPlot.render();

           prepared = true;
           // update the plot
           update(false);
       }else {
           prepared = false;
       }
   }

   /**
    * Update the chart
    * @param {boolean} force Force the update despite the chart container not being visible
    * @returns void
    */
   function update(force){
       if(!prepared ){
           if($(line_container_id).is(":visible")){
               prepared = true;
               prepare();
           }else{
               return;
           }
       }
       if(prepared && ($(line_container_id).is(":visible") || force)){
           // only update if plot is visible
           // add the selected data series to the "series" variable
          old_series = series;
           new_data_bool = false;
           series = [];
           start_id = 0;

           for (var key in keys){
               key = keys[key];
               //console.log(apexPlot);
               if($(legend_checkbox_id+key).is(':checked') && typeof(DATA[key]) === 'object'){
                if (DATA_DISPLAY_TO_TIMESTAMP > 0 && DATA_DISPLAY_FROM_TIMESTAMP > 0){
                  start_id = find_index_sub_gte(DATA[key],DATA_DISPLAY_FROM_TIMESTAMP,0);
                  stop_id = find_index_sub_lte(DATA[key],DATA_DISPLAY_TO_TIMESTAMP,0);
              }else if (DATA_DISPLAY_FROM_TIMESTAMP > 0 && DATA_DISPLAY_TO_TIMESTAMP < 0){
                  start_id = find_index_sub_gte(DATA[key],DATA_DISPLAY_FROM_TIMESTAMP,0);
                  stop_id = find_index_sub_lte(DATA[key],DATA_TO_TIMESTAMP,0);
              }else if (DATA_DISPLAY_FROM_TIMESTAMP < 0 && DATA_DISPLAY_TO_TIMESTAMP > 0){
                  if (DATA_DISPLAY_TO_TIMESTAMP < DATA[key][0][0]){continue;}
                  start_id = find_index_sub_gte(DATA[key],DATA_FROM_TIMESTAMP,0);
                  stop_id = find_index_sub_lte(DATA[key],DATA_DISPLAY_TO_TIMESTAMP,0);
              }else {
                  start_id = find_index_sub_gte(DATA[key],DATA_FROM_TIMESTAMP,0);
                  stop_id = find_index_sub_lte(DATA[key],DATA_TO_TIMESTAMP,0);
              }
              if (typeof(start_id) == "undefined") {
                  continue;
              }else {
                  chart_data = DATA[key].slice(start_id,stop_id+1);
              }
              for (serie in old_series) {
                if (new_data_bool === false && chart_data.length > 0 && key === old_series[serie]['key'] && chart_data.length !== old_series[serie]['data'].length && (old_series[serie]['data'].length == 0 || chart_data[0][0] !== old_series[serie]['data'][0][0] || chart_data[0][1] !== old_series[serie]['data'][0][1] || chart_data[chart_data.length-1][0] !== old_series[serie]['data'][old_series[serie]['data'].length-1][0] && chart_data[chart_data.length-1][1] !== old_series[serie]['data'][old_series[serie]['data'].length-1][-1])) {
                  new_data_bool = true;
                }
              }
              series.push({"data":chart_data, "key":key, "label":variables[key].label,"unit":variables[key].unit, "color":variables[key].color});
              //series.push({"data":DATA[key][DATA[key].length - 1], "label":variables[key].label,"unit":variables[key].unit, "color":variables[key].color});
            }
           }
            if (new_data_bool || old_series.length == 0 || force) {

               if (typeof apexPlot !== 'undefined' && apexPlot !== null) {
                   // update flot plot
                    var dataLine;
                    var dataName;
                    var datas = [];

                    var variablesColors = [];

                    for (var i = 0; i<series.length; i++){

                        dataName = series[i].label;
                        dataLine = series[i].data;
                        // dataLine = [{
                        //   x: "02-02-2002",
                        //   y: 44
                        // }, {
                        //   x: "12-02-2002",
                        //   y: 51
                        // }]

                        datas.push({name:dataName,data:dataLine});

                        // apexPlot.appendSeries({
                        //     name: dataName,
                        //     data : dataLine
                        // });

                        variablesColors.push(series[i].color);
                    }
                    apexPlot.updateOptions({
                        series: datas,
                        colors: variablesColors
                      });
               }
           }
       }
   }
   
   /**
    * Resize the chart when the navigator window dimension changed
    * @returns void
    */
   function resize() {
   }
}

$( document ).ready(function() {
$.each($('.chartApex-container'),function(key,val){
    // get identifier of the chart
    id = val.id.substring(16);

    // add a new Plot
    if ($(val).data('type')==0){
    PyScadaPlots.push(new Bar(id));
    }
    else{
       PyScadaPlots.push(new Line(id));
    }
});
});