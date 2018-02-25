document.addEventListener("DOMContentLoaded", function(){
  var width = 500;
  var height = 500;
  var padding = 20;

  var graph1 = d3.select("#graph1")
  .attr("width", width)
  .attr("height", height);

  var graph2 = d3.select("#graph2")
  .attr("width", width)
  .attr("height", height);

  var graph3 = d3.select("#graph3")
  .attr("width", width)
  .attr("height", height);



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

    console.log(race_array);
    raceGraph(race_array);

  }

  function raceGraph(data){
    var frequency_total = 0;

    data.forEach(function(element){
      frequency_total += element.value;
    });

    var race_frequency_array = [];
    data.forEach(function(element){
      var percent = Math.round(element.value/frequency_total * 100);
      if(element.key == "White"){
        percent--;
      }
      race_frequency_array.push({"Race" : element.key,"Percentage" : percent});
    });
    console.log(race_frequency_array);

  }


});
