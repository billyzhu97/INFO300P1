document.addEventListener("DOMContentLoaded", function(){
  var width = 200;
  var height = 200;
  var padding = 20;



  var graph2 = d3.select("#graph2")
  .attr("width", width)
  .attr("height", height);

  var graph3 = d3.select("#graph3")
  .attr("width", width)
  .attr("height", height);

  // People pictogram
  var graph1 = d3.select("#graph1")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox","0 0 " + " " + width + " " + height);

   // Define an icon & store it in svg <defs> elements as a reusable component
  graph1.append("defs")
        .append("g")
          .attr("id","iconCustom")
        .append("polygon")
          .attr("points", "5 4 0 4 0 9.27866644 0.897118066 9.27866644 1.41351985 14 3.58581611 14 4.10243924 9.27866644 5 9.27866644")
  d3.select("#iconCustom")
    .append("circle")
    .attr("cx","2.5")
    .attr("cy","1.5")
    .attr("r","1.5")

  //background rectangle
  graph1.append("rect").attr("width",width).attr("height",height);

  d3.csv("data/police_killings.csv", callback);

  function callback(error, data) {
    var race_array = d3.nest()
    .key(function(d) { return d.raceethnicity; })
    .rollup(function(v){return v.length;})
    .entries(data);

    var armed_array  = d3.nest()
    .key(function(d) { return d.armed; })
    .rollup(function(v){return v.length;})
    .entries(data);

    makeRaceGraph(race_array);

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
    var hBuffer = 16;
    var vBuffer = 8;

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

}); // End DOMContentLoaded
