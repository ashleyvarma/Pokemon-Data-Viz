var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d["Sp. Def"];}, // data -> value
    xScale = d3.scale.linear().range([0, width - 85]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d["Total"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d["Type 1"];},
    color = d3.scale.category20();

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// tooltip mouseover event handler
var tipMouseover = function(d) {
    var html  = d["Name"] + "<br/>" + "<b>" + d["Type 1"] + "<br/>" + "<b>" + d["Type 2"] + "<br/>";

    tooltip.html(html)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
    .transition()
        .duration(200) // ms
        .style("opacity", .9) // started as 0!

};
// tooltip mouseout event handler
var tipMouseout = function(d) {
    tooltip.transition()
        .duration(300) // ms
        .style("opacity", 0); // don't care about position!
};

let generations = ["(All)",1,2,3,4,5,6]
let legendary = ["(All)", "TRUE", "FALSE"]

let filter1Text = d3.select('body')
    .append('h1')
    .text("Legendary");

let filter1 = d3.select('body')
    .append('select')
    .attr('id',"legendary")  
    .selectAll('option')    
    .data(legendary)
    .enter()
        .append('option')
        .attr('value', function(d) {
            return d 
        })
        .html(function(d) { 
            return d 
        })

    filter1 = d3.select("#legendary")

let filter2Text = d3.select('body')
    .append('h1')
    .text("Generation (group)");

let filter2 = d3.select('body')
    .append('select')
    .attr('id', "gen")   
    .selectAll('option')
    .data(generations)
    .enter()
        .append('option')
        .html(function(d) { return d })
        .attr('value', function(d) { return d })

    filter2 = d3.select("#gen")

// load data
d3.csv("pokemon.csv", function(error, data) {
    // change string (from CSV) into number format
    data.forEach(function(d) {
        d["Sp. Def"] = +d["Sp. Def"];
        d["Total"] = +d["Total"];
        //console.log(d);
    });
    drawScatterPlot(data);
});

function drawScatterPlot(data) {

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-10, d3.max(data, xValue)+10]);
    yScale.domain([d3.min(data, yValue)-10, d3.max(data, yValue)+20]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Sp. Def");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Total");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { 
            return color(cValue(d));
            }) 
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout);

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})
}
  
      // Update value when the button is changed
      d3.select("#legendary").on("change", update)
      d3.select("#gen").on("change", update)

    function update() {
        let getFilter1 = document.getElementById("legendary")
        let getFilter2 = document.getElementById("gen")

        let filtervalue1 = getFilter1.options[getFilter1.selectedIndex].value
        let filtervalue2 = getFilter2.options[getFilter2.selectedIndex].value

        if (filtervalue1 === "(All)" && filtervalue2 === "(All)") {
            svg.selectAll("*").remove();
            d3.csv("pokemon.csv", function(data) {
                data.forEach(function(d) {
                    d["Sp. Def"] = +d["Sp. Def"];
                    d["Total"] = +d["Total"];
                });
                drawScatterPlot(data);
            });
        } else if (filtervalue1 === "(All)" && !(filtervalue2 === "(All)")) {
            svg.selectAll("*").remove();
            d3.csv("pokemon.csv", function(data) {
                data.forEach(function(d) {
                    d["Sp. Def"] = +d["Sp. Def"];
                    d["Total"] = +d["Total"];
                });
                data.filter(function(d, filtervalue2) {return d["Generation"] == filtervalue2})
                drawScatterPlot(data.filter(function(d) {return d["Generation"] == filtervalue2}))
            });
        } else if(filtervalue2==="(All)" && !(filtervalue1 === "(All)")) {
            svg.selectAll("*").remove();
            d3.csv("pokemon.csv", function(data) {
                data.forEach(function(d) {
                    d["Sp. Def"] = +d["Sp. Def"];
                    d["Total"] = +d["Total"];
                });
                data.filter(function(d, filtervalue1) {return d["Legendary"] == filtervalue1})
                drawScatterPlot(data.filter(function(d) {return d["Legendary"] == filtervalue1}))
            });
        } else {
            svg.selectAll("*").remove();
            d3.csv("pokemon.csv", function(data) {
                data.forEach(function(d) {
                    d["Sp. Def"] = +d["Sp. Def"];
                    d["Total"] = +d["Total"];
                });
                data.filter(function(d, filtervalue1) {return d["Legendary"] == filtervalue1})
                data.filter(function(d, filtervalue2) {return d["Generation"] == filtervalue2})
                drawScatterPlot(data.filter(function(d) {return d["Legendary"] == filtervalue1 && d["Generation"] == filtervalue2}))
            });
        }        
    }