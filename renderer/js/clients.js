exports.initialize = (actionName) => {
    let actionArray = actionName.split('/')
    let actionIndex = actionArray.length - 2
    var action = '';

    if (actionIndex >= 1) {
        actionArray.forEach(part => {
            if (part) {
                action += ('.' + part)
            }
        })
    } else {
        action = actionArray[actionIndex]
    }

    //action();
    
    console.log(action);
}



const main = () => {

}

const reports = () => {
    const details = () => {
        console.log('ansestor function()')
    }
}