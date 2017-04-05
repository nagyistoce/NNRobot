﻿createMap('/positionStream', "#map",true,500,500);
createMap('/kmeans', "#kmeans",false,1000,1000);


function createMap(urlData,eleDiv,ismap,w,h) {
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    /* 
     * value accessor - returns the value to encode for a given data object.
     * scale - maps value to a visual display encoding, such as a pixel position.
     * map function - maps from data value to display value
     * axis - sets up axis
     */

    // setup x 
    var xValue = function (d) {
        return d.x;
    }, // data -> value
        xScale = d3.scaleLinear().range([0, width]), // value -> display
        xMap = function (d) { return xScale(xValue(d)); }, // data -> display
        xAxis = d3.axisBottom(xScale);

    // setup y
    var yValue = function (d) {
        return d.y;
    }, // data -> value
        yScale = d3.scaleLinear().range([height, 0]), // value -> display
        yMap = function (d) { return yScale(yValue(d)); }, // data -> display
        yAxis = d3.axisLeft(yScale);

    // setup fill color
    var cValue = function (d) { return "(" + d.x + "," + d.y + ")"; }
    var color = d3.scale.linear()
        .domain([0, width / 4, width / 4 * 2, width / 4 * 3, width])
        .range(["#fb000f", "#6e00fb", "#00fbec", "#8dfb00", "#fb3c00"])
        .interpolate(d3.interpolateHsl);

    // add the graph canvas to the body of the webpage
    var map = d3.select(eleDiv).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select(eleDiv).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // x-axis
    map.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("X");

    // y-axis
    map.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Y");

    getPositions();
    // load data
    function getPositions() {
        d3.interval(function () {
            d3.json(urlData, function (error, posData) {
                if (posData.buffer != undefined) {
                    if (posData.buffer.length > 0) {
                        updateMap(posData);
                    }
                }
                //getPositions();
            });
        }, 1000);
    }

    var jdata = []
    var isadd = 0
    var divisorMap = 1
    if (ismap) { divisorMap = 4000; }

    function updateMap(data) {

        if (ismap) {
           changeDataMap(data);
        }
        else {
           changeData(data);
        }

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(jdata, xValue) , d3.max(jdata, xValue) ]);
        yScale.domain([d3.min(jdata, yValue) , d3.max(jdata, yValue) ]);

        map.select('.x.axis').transition().duration(200).call(xAxis);
        map.select(".y.axis").transition().duration(200).call(yAxis)


        // draw dots
        var dots = map.selectAll(".dot")
            .data(jdata)
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Positions  <br/> (" + xValue(d)
                    + ", " + yValue(d) + ")")
                    .style("left", (d3v3.event.pageX + 5) + "px")
                    .style("top", (d3v3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        dots.exit()
            .transition()
            .duration(100)
            .style("opacity", "0.1")
            .remove()       
        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                if (d.range == -1) {
                    return 5
                }
                return 2.5

            })
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function (d) {
                if (d.range == -1) {
                    return d3.rgb(0,0,0).toString()
                }
                return d3.rgb(color((((d.range / divisorMap) % 20) * 38) + 10)).darker(Math.floor((d.range / divisorMap) / 20) * (1 / 4)).toString();
            })
            .transition()
            .duration(500)
            .style("opacity", function (d, i) { return (i / jdata.length) })

        dots.transition().duration(100)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .attr("r", function (d) {
                if (d.range == -1) {
                    return 5
                }
                return 2.5
            })
            .style("opacity", function (d, i) { return (i / jdata.length) })
            .style("fill", function (d) {
                if (d.range == -1) {
                    return d3.rgb(0, 0, 0).toString()
                }
                return d3.rgb(color((((d.range) % 20) * 38) + 10)).darker(Math.floor((d.range) / 20) * (1 / 4)).toString();
            })


    }

    function changeDataMap(data) {
        // change string (from CSV) into number format   
        data.buffer.forEach(function (d) {
            var json = JSON.stringify(eval("(" + d + ")"));
            var object = JSON.parse(json)
            if (jdata.length > 5000) {
                jdata.splice(0, 1500);
            }
            if (object.range < 3900 && isadd == 0) {
                jdata.push(object);
            }
            if (isadd > 40) {
                isadd = 0
            }
            else {
                isadd++
            }
        });      
    }

    function changeData(data) {
        // change string (from CSV) into number format   
        jdata = []
        data.buffer.forEach(function (d) {
            var json = JSON.stringify(eval("(" + d + ")"));
            var object = JSON.parse(json)          
            jdata.push(object);    
        });       
    }
}