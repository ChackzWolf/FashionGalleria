function calculatePercentageDifference(originalPrice, discountPrice) {
    let  result = ((discountPrice-originalPrice)/originalPrice)*100
    result = Math.trunc(result);
    result = Math.abs(result);
    return result;
}    



// Function to apply a percentage reduction to a price
function reducePercentageFromPrice(price, percentage) {
    const amount = (price*percentage)/100
    let result = price-amount
    result = Math.trunc(result)
    return result;
}



module.exports = {calculatePercentageDifference,reducePercentageFromPrice}; 