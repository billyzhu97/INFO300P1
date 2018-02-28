document.addEventListener("DOMContentLoaded", function(){
  var width = 1050;
  var height = 700;

  var padding = 40;


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
  .attr("points", "11.6475 9.0615 0.353 9.0615 0.353 21.6015 2.3795 21.6015 3.546 32.8175 8.453 32.8175 9.62 21.6015 11.6475 21.6015")
  d3.select("#iconCustom")
  .append("circle")
  .attr("cx","6")
  .attr("cy","3.9215")
  .attr("r","3.739")

  //background rectangle
  graph1.append("rect").attr("width",width).attr("height",height);

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

    console.log(race_array);

    makeRaceGraph(race_array);
    makeArmedGraph(armed_array);
    makeArmedbyRaceChart(armed_by_race_array);
  }

  function makeRaceGraph(data){
    var totalDeaths = 0;

    data.forEach(function(element){
      totalDeaths += element.value; // element.value is frequency
    });

    var race_frequency_array = [];

    // Sort array in descending frequency order (Greatest -> Least frequent)
    data.sort(function(a, b) {
      return parseFloat(b.value) - parseFloat(a.value);
    });
    var max_index = 0; // Last index for each type of colored icon. Indexes range from 0-99
    var order = 1;
    data.forEach(function(element){
      max_index += element.value; // element.value represents 1 death
      race_frequency_array.push({"Race" : element.key,"TotalDeaths" : element.value, "MaxIndex" : max_index - 1, "Order" :  order});
      order += 1;
    });

    // Number of cols & rows for pictogram
    var numCols = 50;
    var numRows = Math.round(totalDeaths/numCols);

    // Grid padding
    var xPadding = 30;
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

    var size = ['60','50','40','30'];
    var sizeScale = d3.scaleLinear().domain([0, 1, 2, 3]).range(size);


    myIndex.forEach(function(index) {
      var person = graph1.select("#icon"+index)
      if(index <= race_frequency_array[0].MaxIndex) {
        person.classed("iconRed",true);
      } else if(index <= race_frequency_array[1].MaxIndex) {
        person.classed("iconBlue", true);
      } else if(index <= race_frequency_array[2].MaxIndex) {
        person.classed("iconGreen", true);
      } else if (index <= race_frequency_array[3].MaxIndex){
        person.classed("iconOrange", true);
      } else { // Remove extra people in graph
        person.remove()
      }
    });

    var y_position = 420;
    var text_size = 0;
    var index = 0;
    race_frequency_array.forEach(function(element){
      graph1.append("text")
      .attr("x", xPadding)
      .attr("y", y_position)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "hanging")
      .attr("font-size", parseInt(sizeScale(index)))
      .text(element.TotalDeaths + " people killed were " + element.Race);
      y_position += parseInt(sizeScale(index))+10;
      index++;
    })

  } // End makeRaceGraph

  function makeArmedGraph(data){

    //constants
    var width = 800;
    var height = 800;
    var bar_padding = 20;
    var padding = 80;

    //instantiates graph for problem 1
    var graph = d3.select("#graph2")
    .attr("width", width)
    .attr("height", height);

    // Sort array in descending frequency order (Greatest -> Least frequent)
    data.sort(function(a, b) {
      return parseFloat(b.value) - parseFloat(a.value);
    });

    var max_percent = data[0].value;
    var categories = [];
    data.forEach(function(element){
      categories.push(element.key);
    })

    var yScale = d3.scaleLinear()
    .domain([0, max_percent+bar_padding]).range([height-padding, padding]);
    var xScale = d3.scaleBand()
    .rangeRound([padding, width-padding]).padding(0.1)
    .domain(categories);



    var xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    graph.append("g")
    .attr("transform", "translate(0, "+ (width-padding) +")")
    .attr("class", "axis")
    .call(xAxis);

    var yAxis = d3.axisLeft(yScale).tickSizeOuter(0);
    graph.append("g")
    .attr("transform", "translate(" + padding + ", 0)")
    .attr("class", "axis")
    .call(yAxis);

    graph.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.key); })
    .attr("y", function(d) { return yScale(d.value); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return height-padding - yScale(d.value); });

    graph.append("text")
    .attr("x", (width+padding)/2)
    .attr("y", padding/2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Why Were They Killed?");

    graph.append("text")
    .attr("x", (width+padding)/2)
    .attr("y", height - padding/4)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Armed Category");

    graph.append("text")
    .attr("x", padding/4)
    .attr("y", (height-padding)/2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Count");
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
