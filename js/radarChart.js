var canvas = document.getElementById('radarChart');
var ctx = canvas.getContext('2d');

var data = {
    'Focus': 25,
    'Reach': 15,
    'Control': 30,
    'Capacity': 25,
    'Bandwidth': 5,
};

var centerX = canvas.width / 2;
var centerY = canvas.height / 2;
var radius = 140;
var maxValue = 30;
var levels = 6;
var keys = Object.keys(data);
var dataValues = keys.map(function (key) { return data[key]; });
var numAxes = keys.length;
var angleStep = (2 * Math.PI) / numAxes;

// Function to draw the grid and axes
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (var level = 1; level <= levels; level++) {
        ctx.beginPath();
        var levelRadius = (radius / levels) * level;
        for (var i = 0; i <= numAxes; i++) {
            var angle = i * angleStep;
            var x = centerX + levelRadius * Math.sin(angle);
            var y = centerY - levelRadius * Math.cos(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    for (var i = 0; i < numAxes; i++) {
        var angle = i * angleStep;
        var x = centerX + radius * Math.sin(angle);
        var y = centerY - radius * Math.cos(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

// Function to plot the data
function plotData() {
    ctx.beginPath();
    var gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(60, 64, 93, 0.4)');
    gradient.addColorStop(0.5, 'rgba(137, 59, 133, 0.5)');
    gradient.addColorStop(1, 'rgba(203, 32, 64, 0.8)');

    for (var i = 0; i < numAxes; i++) {
        var value = dataValues[i];
        var angle = i * angleStep;
        var valueRadius = (value / maxValue) * radius;
        var x = centerX + valueRadius * Math.sin(angle);
        var y = centerY - valueRadius * Math.cos(angle);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Function to add labels
function addLabels() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Montserrat';
    ctx.textAlign = 'center';
    for (var i = 0; i < numAxes; i++) {
        var angle = i * angleStep;
        var x = centerX + (radius + 40) * Math.sin(angle);
        var y = centerY - (radius + 40) * Math.cos(angle);
        ctx.fillText(keys[i], x, y);
    }
}

// Function to add level labels (optional)
function addLevelLabels() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px Montserrat';
    ctx.textAlign = 'center';
    for (var level = 1; level <= levels; level++) {
        var levelRadius = (radius / levels) * level;
        ctx.fillText((level * (maxValue / levels)).toString(), centerX, centerY - levelRadius);
    }
}

// Draw the chart
drawGrid();
plotData();
addLabels();
addLevelLabels();