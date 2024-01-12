const generateRandomOrderId = ()=>{
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random()*1000).toString().padStart(3,'0');//3 - digit random number
    const orderId = `${timestamp}${randomNum}`.slice(0,10);
    
    return orderId;
} 

module.exports = generateRandomOrderId