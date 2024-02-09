
function calculatePercentageDifference(num1, num2) {
    // Calculate the absolute difference between the two numbers
    var absoluteDifference = Math.abs(num1 - num2);
    
    // Calculate the average of the two numbers
    var average = (num1 + num2) / 2;
    
    // Calculate the percentage difference
    var percentageDifference = (absoluteDifference / average) * 100;
    
    return percentageDifference.toFixed(2); // Round to 2 decimal places
}


function reducePercentageFromPrice(price, percentage) {
    // Calculate the amount to be reduced
    var reductionAmount = (percentage / 100) * price;
    
    // Subtract the reduction amount from the original price
    var reducedPrice = price - reductionAmount;
    
    return reducedPrice;
}


module.exports = {calculatePercentageDifference,reducePercentageFromPrice}