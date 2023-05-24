//some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr) {
    var total = arr.reduce(function (sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr) {
    return arr.reduce(function (a, b) { return Math.max(a, b); })
}

// Helper function to generate random numbers within a range
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function toHexColor(floatNumber) {
    var normalizedNumber = (Math.abs(floatNumber) + 1) / 2; // Normalize to the range 0-1
  
    var maxHexValue = 0xFFFFFF; // Maximum value of a hexadecimal color
    var hexColor = Math.floor(normalizedNumber * maxHexValue);
  
    return hexColor;
  }
  