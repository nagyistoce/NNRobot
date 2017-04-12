﻿var d3v3=d3
var config1 = liquidFillGaugeDefaultSettings();
config1.circleColor = "#003249";
config1.textColor = "#9AD1D4";
config1.waveTextColor = "#007EA7";
config1.displayPercent = false;
config1.waveColor = "#80CED7";
config1.circleThickness = 0.05;
config1.textVertPosition = 0.5;
config1.waveAnimateTime = 1000;
config1.waveRiseTime = 1000;
config1.maxValue = 100
var config2 = liquidFillGaugeDefaultSettings();
config2.circleColor = "#003249";
config2.textColor = "#9AD1D4";
config2.waveTextColor = "#007EA7";
config2.waveColor = "#80CED7";
config2.displayPercent = false;
config2.circleThickness = 0.05;
config2.textVertPosition = 0.5;
config2.waveAnimateTime = 1000;
config2.waveRiseTime = 1000;
config2.maxValue = 15
var config3 = liquidFillGaugeDefaultSettings();
config3.circleColor = "#003249";
config3.textColor = "#9AD1D4";
config3.waveTextColor = "#007EA7";
config3.waveColor = "#70ea6b";
config3.circleThickness = 0.05;
config3.displayPercent = true;
config3.textVertPosition = 0.5;
config3.waveAnimateTime = 1000;
config3.waveRiseTime = 1000;
config3.maxValue = 100
d3v3.selectAll(".liquidv").style("opacity", "1");
var gauge1 = loadLiquidFillGauge("fillgauge1", 0, config1);
var gauge2 = loadLiquidFillGauge("fillgauge2", 0, config2);
var gauge3 = loadLiquidFillGauge("fillgauge3", 0, config2);
var gauge4 = loadLiquidFillGauge("fillgauge4", 0, config3);
var gauge5 = loadLiquidFillGauge("fillgauge5", 0, config3);
logic();
image();
explore();
cpu();
memory();
function logic() {
    d3v3.json("/paralelsi?thread=logic", function (error, data) {
        porcentaje = data.ips
        gauge1.update(porcentaje);        
        setTimeout(logic,2000);
    });    
}
function image() {
    d3v3.json("/paralelsi?thread=image", function (error, data) {
        porcentaje = data.ips
        gauge2.update(porcentaje);
        setTimeout(image,2000);
    });    
}
function explore() {
    d3v3.json("/paralelsi?thread=explore", function (error, data) {
        porcentaje = data.ips
        gauge3.update(porcentaje);
        setTimeout(explore,2000);
    });    
}
function cpu() {
    d3v3.json("/paralelsi?thread=cpu", function (error, data) {
        porcentaje = data.ips
        gauge4.update(porcentaje);
        setTimeout(cpu, 2000);
    });
}
function memory() {
    d3v3.json("/paralelsi?thread=memory", function (error, data) {
        porcentaje = data.ips
        gauge5.update(porcentaje);
        setTimeout(memory, 2000);
    });
}
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


function liquidFillGaugeDefaultSettings() {
        return {
            minValue: 0, // The gauge minimum value.
            maxValue: 15, // The gauge maximum value.
            circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
            circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            circleColor: "#178BCA", // The color of the outer circle.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 0, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 0, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#178BCA", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
            textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
            valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
            displayPercent: true, // If true, a % symbol is displayed after the value.
            textColor: "#045681", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
        };
    }

function loadLiquidFillGauge(elementId, value, config) {
        if (config == null) config = liquidFillGaugeDefaultSettings();

        var gauge = d3v3.select("#" + elementId);
        var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height"))) / 2;
        var locationX = parseInt(gauge.style("width")) / 2 - radius;
        var locationY = parseInt(gauge.style("height")) / 2 - radius;
        var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

        var waveHeightScale;
        if (config.waveHeightScaling) {
            waveHeightScale = d3v3.scale.linear()
                .range([0, config.waveHeight, 0])
                .domain([0, 50, 100]);
        } else {
            waveHeightScale = d3v3.scale.linear()
                .range([config.waveHeight, config.waveHeight])
                .domain([0, 100]);
        }

        var textPixels = (config.textSize * radius / 4);
        var textFinalValue = parseFloat(value).toFixed(2);
        var textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
        var percentText = config.displayPercent ? " %" : " IPS";
        var circleThickness = config.circleThickness * radius;
        var circleFillGap = config.circleFillGap * radius;
        var fillCircleMargin = circleThickness + circleFillGap;
        var fillCircleRadius = radius - fillCircleMargin;
        var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

        var waveLength = fillCircleRadius * 2 / config.waveCount;
        var waveClipCount = 1 + config.waveCount;
        var waveClipWidth = waveLength * waveClipCount;

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        var textRounder = function (value) { return Math.round(value); };
        if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
            textRounder = function (value) { return parseFloat(value).toFixed(1); };
        }
        if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
            textRounder = function (value) { return parseFloat(value).toFixed(2); };
        }

        // Data for building the clip wave area.
        var data = [];
        for (var i = 0; i <= 40 * waveClipCount; i++) {
            data.push({ x: i / (40 * waveClipCount), y: (i / (40)) });
        }

        // Scales for drawing the outer circle.
        var gaugeCircleX = d3v3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
        var gaugeCircleY = d3v3.scale.linear().range([0, radius]).domain([0, radius]);

        // Scales for controlling the size of the clipping path.
        var waveScaleX = d3v3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
        var waveScaleY = d3v3.scale.linear().range([0, waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        var waveRiseScale = d3v3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
            .domain([0, 1]);
        var waveAnimateScale = d3v3.scale.linear()
            .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // Scale for controlling the position of the text within the gauge.
        var textRiseScaleY = d3v3.scale.linear()
            .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
            .domain([0, 1]);

        // Center the gauge within the parent SVG.
        var gaugeGroup = gauge.append("g")
            .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

        // Draw the outer circle.
        var gaugeCircleArc = d3v3.svg.arc()
            .startAngle(gaugeCircleX(0))
            .endAngle(gaugeCircleX(1))
            .outerRadius(gaugeCircleY(radius))
            .innerRadius(gaugeCircleY(radius - circleThickness));
        gaugeGroup.append("path")
            .attr("d", gaugeCircleArc)
            .style("fill", config.circleColor)
            .attr('transform', 'translate(' + radius + ',' + radius + ')');

        // Text where the wave does not overlap.
        var text1 = gaugeGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .style("fill", config.textColor)
            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

        // The clipping wave area.
        var clipArea = d3v3.svg.area()
            .x(function (d) { return waveScaleX(d.x); })
            .y0(function (d) { return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI)); })
            .y1(function (d) { return (fillCircleRadius * 2 + waveHeight); });
        var waveGroup = gaugeGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + elementId);
        var wave = waveGroup.append("path")
            .datum(data)
            .attr("d", clipArea)
            .attr("T", 0);

        // The inner circle with the clipping wave attached.
        var fillCircleGroup = gaugeGroup.append("g")
            .attr("clip-path", "url(#clipWave" + elementId + ")");
        fillCircleGroup.append("circle")
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", fillCircleRadius)
            .style("fill", config.waveColor);

        // Text where the wave does overlap.
        var text2 = fillCircleGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .style("fill", config.waveTextColor)
            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

        // Make the value count up.
        if (config.valueCountUp) {
            var textTween = function () {
                var i = d3v3.interpolate(this.textContent, textFinalValue);
                return function (t) { this.textContent = textRounder(i(t)) + percentText; }
            };
            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
        }

        // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
        var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
        if (config.waveRise) {
            waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
                .each("start", function () { wave.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else {
            waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
        }

        if (config.waveAnimate) animateWave();

        function animateWave() {
            wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
            wave.transition()
                .duration(config.waveAnimateTime * (1 - wave.attr('T')))
                .ease('linear')
                .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
                .attr('T', 1)
                .each('end', function () {
                    wave.attr('T', 0);
                    animateWave(config.waveAnimateTime);
                });
        }

        function GaugeUpdater() {
            this.update = function (value) {
                var newFinalValue = parseFloat(value).toFixed(2);
                var textRounderUpdater = function (value) { return Math.round(value); };
                if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                    textRounderUpdater = function (value) { return parseFloat(value).toFixed(1); };
                }
                if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                    textRounderUpdater = function (value) { return parseFloat(value).toFixed(2); };
                }

                var textTween = function () {
                    var i = d3v3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                    return function (t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
                };

                text1.transition()
                    .duration(config.waveRiseTime)
                    .tween("text", textTween);
                text2.transition()
                    .duration(config.waveRiseTime)
                    .tween("text", textTween);

                var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
                var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
                var waveRiseScale = d3v3.scale.linear()
                    // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                    // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                    // circle at 100%.
                    .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                    .domain([0, 1]);
                var newHeight = waveRiseScale(fillPercent);
                var waveScaleX = d3v3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
                var waveScaleY = d3v3.scale.linear().range([0, waveHeight]).domain([0, 1]);
                var newClipArea;
                if (config.waveHeightScaling) {
                    newClipArea = d3v3.svg.area()
                        .x(function (d) { return waveScaleX(d.x); })
                        .y0(function (d) { return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI)); })
                        .y1(function (d) { return (fillCircleRadius * 2 + waveHeight); });
                } else {
                    newClipArea = clipArea;
                }

                var newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
                wave.transition()
                    .duration(0)
                    .transition()
                    .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : (config.waveRiseTime))
                    .ease('linear')
                    .attr('d', newClipArea)
                    .attr('transform', 'translate(' + newWavePosition + ',0)')
                    .attr('T', '1')
                    .each("end", function () {
                        if (config.waveAnimate) {
                            wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                            animateWave(config.waveAnimateTime);
                        }
                    });
                waveGroup.transition()
                    .duration(config.waveRiseTime)
                    .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')')
            }
        }

        return new GaugeUpdater();
    }