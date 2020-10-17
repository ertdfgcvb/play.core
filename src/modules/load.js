/**
@module    loader.js
@desc      Various file type loader, returns a Promise
@cathegory internal

TODO: add full desc
*/

function image (path) {

    return new Promise(function(resolve, reject) {
        const img = new Image()
        img.src = path
        img.onload = () => resolve(img)
        img.onerror = () => {
            console.log('Loader: error loading image ' + path)
            resolve(img)
        }
    })
}

function text (path) {

    return fetch(path).then(function(response) {
        return response.text()
    }).catch(function(){
        console.log('Loader: error loading text ' + path)
        return ''
    })
}

function json (path) {

    return fetch(path).then(function(response) {
        return response.json()
    }).catch(function(){
        console.log('Loader: error loading json ' + path)
        return {}
    })
}


export default {
    json,
    image,
    text
}


/* ------------------------------------------------------------

    Usage:  Load different file types with one callback
    Promise.all([
        Load.txt('assets/1/text.txt'),
        Load.img('assets/1/blocks.png'),
        Load.img('assets/1/colors.png'),
    ]).then(function(res) {
        console.log('Everything has loaded!');
        console.log(res);
    }).catch(function() {
        console.log('Error');
    });

*/

