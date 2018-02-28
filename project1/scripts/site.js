document.addEventListener("DOMContentLoaded", function(){
  var width = 420;
  var height = 500;

  var padding = 20;


  // People pictogram
  var graph1 = d3.select("#graph1")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox","0 0 " + " " + width + " " + height);

  var graph2 = d3.select("#graph2")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox","0 0 " + " " + width + " " + height);

  // Define an icon & store it in svg <defs> elements as a reusable component
  graph1.append("defs")
  .append("g")
  .attr("id","iconCustom")
  .append("polygon")
  .attr("points", "11.6475 9.0615 0.353 9.0615 0.353 21.6015 2.3795 21.6015 3.546 32.8175 8.453 32.8175 9.62 21.6015 11.6475 21.6015")
  d3.select("#iconCustom")
  .append("circle")
  .attr("cx","6")
  .attr("cy","3.9215")
  .attr("r","3.739")

  graph2.append("defs")
  .append("g")
  .attr("id","gunSymbol")
  .append("path")
  .attr("d", "M52.5417157,11.625119 L47.1919343,11.631521 L54.4149562,27.015921 C54.4149562,27.015921 56.2627059,30.567333 55.4090939,32.7346063 C54.545547,34.948392 51.8385642,34.9847136 51.8385642,34.9847136 L41.1451454,35 L36.4731556,23.2898259 L18.7597256,23.3264087 L18.731359,11.6935812 L0.0309810184,11.7304254 L0,0.0570953954 L52.5179244,0 L52.5417157,11.625119 Z M23.1961552,18.8719227 L34.7150808,18.8566362 L32.6027505,13.5683222 L29.9000815,17.621442 L26.3295518,15.2592344 L28.7141752,11.6716315 L23.1834752,11.6897923 L23.1961552,18.8719227 Z");
  d3.select("#gunSymbol")
  .attr("transform", "scale(0.6, 0.6)");

  //background rectangle
  graph1.append("rect").attr("width",width).attr("height",height);
  graph2.append("rect").attr("id", "rect2").attr("width",width).attr("height",height);

  d3.csv("./data/police_killings.csv", callback);

  function callback(error, data) {
    var race_array = d3.nest()
    .key(function(d) { return d.raceethnicity; })
    .rollup(function(v){return v.length;})
    .entries(data);

    var armed_array  = d3.nest()
    .key(function(d) { return d.armed; })
    .rollup(function(v){return v.length;})
    .entries(data);

    var armed_by_race_array = d3.nest()
    .key(d => d.raceethnicity)
    .key(d => d.armed)
    .rollup(function(v){return v.length;})
    .entries(data);

    makeRaceGraph(race_array);
    makeArmedGraph(armed_array);
    makeArmedbyRaceChart(armed_by_race_array);
  }

  function makeRaceGraph(data){
    var frequency_total = 0;

    data.forEach(function(element){
      frequency_total += element.value; // element.value is frequency
    });

    var race_frequency_array = [];

    // Sort array in descending frequency order (Greatest -> Least frequent)
    data.sort(function(a, b) {
      return parseFloat(b.value) - parseFloat(a.value);
    });
    var max_index = 0; // Last index for each type of colored icon. Indexes range from 0-99

    data.forEach(function(element){
      var percent = Math.round(element.value/frequency_total * 100);
      // Reduce highest perecentage by 1 to make sure perecentages add up to 100%
      if(element.key == "White"){
        percent--;
      }
      max_index += percent;

      race_frequency_array.push({"Race" : element.key,"Percentage" : percent, "MaxIndex" : max_index - 1 });
    });

    // Number of cols & rows for pictogram
    var numCols = 20;
    var numRows = 5;

    // Grid padding
    var xPadding = 10;
    var yPadding = 15;

    // Horizontal and vertical spacing between the icons
    var hBuffer = 40;
    var vBuffer = 20;

    // Return range for total # of elements
    var myIndex=d3.range(numCols*numRows);

    // Create group element and create an svg <use> element for each icon
    graph1.append("g")
    .attr("id","pictoLayer")
    .selectAll("use")
    .data(myIndex)
    .enter()
    .append("use")
    .attr("xlink:href","#iconCustom")
    .attr("id",function(d)    {
      return "icon"+d;
    })
    .attr("x",function(d) {
      var remainder=d % numCols;//calculates the x position (column number) using modulus
      return xPadding+(remainder*vBuffer);//apply the buffer and return value
    })
    .attr("y",function(d) {
      var whole=Math.floor(d/numCols)//calculates the y position (row number)
      return yPadding+(whole*hBuffer);//apply the buffer and return the value
    })

    myIndex.forEach(function(index) {
      var person = graph1.select("#icon"+index)
      if(index <= race_frequency_array[0].MaxIndex) {
        person.classed("iconRed",true);
      } else if(index <= race_frequency_array[1].MaxIndex) {
        person.classed("iconBlue", true);
      } else if(index <= race_frequency_array[2].MaxIndex) {
        person.classed("iconGreen", true);
      } else {
        person.classed("iconOrange", true);
      }
    });
  } // End makeRaceGraph

  function makeArmedGraph(data){
    var frequency_total = 0;

    data.forEach(function(element){
      frequency_total += element.value; // element.value is frequency
    });

    var armed_frequency_array = [];

    // Sort array in descending frequency order (Greatest -> Least frequent)
    data.sort(function(a, b) {
      return parseFloat(b.value) - parseFloat(a.value);
    });
    var max_index = 0; // Last index for each type of colored icon. Indexes range from 0-99

    data.forEach(function(element){
      var percent = Math.round(element.value/frequency_total * 100);
      max_index += percent;
      armed_frequency_array.push({"Type" : element.key,"Percentage" : percent, "MaxIndex" : max_index - 1 });
    });

    console.log(armed_frequency_array);

    // Number of cols & rows for pictogram
    var numCols = 10;
    var numRows = 10;

    // Grid padding
    var xPadding = 20;
    var yPadding = 15;

    // Horizontal and vertical spacing between the icons
    var hBuffer = 30;
    var vBuffer = 38;

    // Return range for total # of elements
    var myIndex=d3.range(numCols*numRows);

    // Create group element and create an svg <use> element for each icon
    graph2.append("g")
    .attr("id","pictoLayer")
    .selectAll("use")
    .data(myIndex)
    .enter()
    .append("use")
    .attr("xlink:href","#gunSymbol")
    .attr("id",function(d)    {
      return "gun"+d;
    })
    .attr("x",function(d) {
      var remainder=d % numCols;//calculates the x position (column number) using modulus
      return xPadding+(remainder*vBuffer);//apply the buffer and return value
    })
    .attr("y",function(d) {
      var whole=Math.floor(d/numCols)//calculates the y position (row number)
      return yPadding+(whole*hBuffer);//apply the buffer and return the value
    })

    myIndex.forEach(function(index) {
      var person = graph2.select("#gun"+index)
      if(index <= armed_frequency_array[0].MaxIndex) {
        person.classed("armedRed",true);
      } else if(index <= armed_frequency_array[1].MaxIndex) {
        person.classed("armedDarkBlue", true);
      } else if(index <= armed_frequency_array[2].MaxIndex) {
        person.classed("armedBlue", true);
      }  else if(index <= armed_frequency_array[3].MaxIndex) {
        person.classed("armedPurple", true);
      }  else if(index <= armed_frequency_array[4].MaxIndex) {
        person.classed("armedGreen", true);
      } else {
        person.classed("armedPink", true);
      }
    });

  } // End makeRaceGraph

  function makeArmedbyRaceChart(armed_by_race_array) {
    // data arrays keep track of not armed, had firearm, had knife, and other weapons counts
    var black = [0,0,0,0];
    var white = [0,0,0,0];
    var hispanic = [0,0,0,0];
    var asian = [0,0,0,0];
    var cur_array = [];
    armed_by_race_array.forEach(function (element) {
      if (element['key'] == 'Black') {
        cur_array = black;
      } else if (element['key'] == 'White') {
        cur_array = white;
      } else if (element['key'] == 'Hispanic/Latino') {
        cur_array = hispanic;
      } else {
        cur_array = asian;
      }
      element['values'].forEach(function (inner_element) {
        
      });
    });
      
    
  } // End makeArmedbyRaceChart

}); // End DOMContentLoaded
