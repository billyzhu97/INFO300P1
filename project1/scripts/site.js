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
  graph1.append("rect").attr("class", "background-rect").attr("width",width).attr("height",height);

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

    var firearm_count = 0;
    var none_count = 0;
    var knife_count = 0;
    var other_count = 0;

    armed_array.forEach(function(element){
      if(element.key=="Non-lethal firearm"||element.key=="Firearm")
        firearm_count += element.value;
      else if(element.key=="Other"||element.key=="Vehicle")
        other_count += element.value;
      else if(element.key=="No")
        none_count+=element.value;
      else
        knife_count+=element.value;
    });

    var modified_armed = [
      {"index": 0, "key": "Firearm" , "value": firearm_count},
      {"index": 1,"key": "None" , "value": none_count},
      {"index": 2,"key": "Knife", "value": knife_count},
      {"index": 3,"key": "Other", "value": other_count}
    ];


    makeRaceGraph(race_array);
    makeArmedGraph(modified_armed);
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
        person.classed("iconPurple", true);
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
    var colorScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3]).range(["#A40E4C", "#2C2C54", "#ACC3A6", "#F49D6E"]);


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
    .style("fill", function(d) { return colorScale(d.index); })
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
    .attr("class", "labels")
    .text("Was There a Threat?");

    graph.append("text")
    .attr("x", (width+padding)/2)
    .attr("y", height - padding/4)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("class", "labels")
    .text("Weapon");

    graph.append("text")
    .attr("x", padding/5)
    .attr("y", (height-padding)/2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("transform", "rotate(270,"+padding/5+","+(height-padding)/2+")")
    .attr("class", "labels")
    .text("People Killed");
  }

  function makeArmedbyRaceChart(armed_by_race_array) {
    // data arrays keep track of not armed, had firearm, had knife, and other weapons counts
    var black = ["black",0,0,0,0];
    var white = ["white",0,0,0,0];
    var hispanic = ["hispanic",0,0,0,0];
    var asian = ["asian",0,0,0,0];
    var cur_array = [];
    var result = [];

    // preprocessing data
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
      var cur_total = 0;
      element['values'].forEach(function (inner_element) {
        if (inner_element['key'] == "No") {
          cur_array[2] = cur_array[2] + inner_element['value'];
          cur_total += inner_element['value'];
        } else if (inner_element['key'] == "Vehicle") {
          cur_array[4] = cur_array[4] + inner_element['value'];
          cur_total += inner_element['value'];
        } else if (inner_element['key'] == "Firearm") {
          cur_array[1] = cur_array[1] + inner_element['value'];
          cur_total += inner_element['value'];
        } else if (inner_element['key'] == "Knife") {
          cur_array[3] = cur_array[3] + inner_element['value'];
          cur_total += inner_element['value'];
        } else if (inner_element['key'] == "Other") {
          cur_array[4] = cur_array[4] + inner_element['value'];
          cur_total += inner_element['value'];
        } else if (inner_element['key'] == "Non-lethal firearm") {
          cur_array[1] = cur_array[1] + inner_element['value'];
          cur_total += inner_element['value'];
        }
      });
      var dict = {
        "race": cur_array[0],
        "Firearm": (cur_array[1]/cur_total)*100,
        "No Weapon": (cur_array[2]/cur_total)*100,
        "Knife": (cur_array[3]/cur_total)*100,
        "Other": (cur_array[4]/cur_total)*100
      };
      result.push(dict);
    });
    
    result.forEach(function(d) {
      d.value = +d.value;
    });

    // constants
    var keys = ["Firearm", "No Weapon", "Knife", "Other"];
    var graph = d3.select("#graph3").attr("width", 800)
      .attr("height", 800);
    var padding = 80;
        margin = {top: 40, right: 20, bottom: 80, left: 80},
        width = +graph.attr("width") - margin.left - margin.right,
        height = +graph.attr("height") - margin.top - margin.bottom;

    // Transpose the data into layers and create the graph
    var dataset = d3.stack().keys(keys)(result);

    var y = d3.scaleBand()
    .rangeRound([0, height])
    .paddingInner(0.05)
    .align(0.1);

    var x = d3.scaleLinear()
    .rangeRound([0,width]);

    var z = d3.scaleOrdinal()
    .range(["#A40E4C", "#2C2C54", "#ACC3A6", "#F49D6E"]);

    y.domain(result.map(function(d) { return d.race; }));
    x.domain([0, 100]).nice();
    z.domain(keys);

    g = graph.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

    g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(result))
      .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("y", function(d) { return y(d.data.race); })
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("height", y.bandwidth());
    
    g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0,"+ height +")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", 360)
      .attr("y", margin.bottom-10)
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .text("Frequency");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    
    g.append("text")
      .attr("x", 360)
      .attr("y", -margin.top/2)
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .text("Weapons Held At Time of Death, By Race");
    
    // create the legend
    // var legend = g.append("g")
    //   .attr("font-size", 10)
    //   .attr("text-anchor", "end")
    //   .selectAll("g")
    //   .data(keys.slice().reverse())
    //   .enter().append("g")
    //   .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // legend.append("rect")
    //   .attr("x", width - 19)
    //   .attr("width", 19)
    //   .attr("height", 19)
    //   .attr("fill", z);

    // legend.append("text")
    //   .attr("x", width - 24)
    //   .attr("y", 9.5)
    //   .attr("dy", "0.32em")
    //   .text(function(d) { return d; });

  } // End makeArmedbyRaceChart

}); // End DOMContentLoaded
