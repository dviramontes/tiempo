import join from 'lodash.join';

function component () {
    var element = document.createElement('div');
    element.innerHTML = join(['All', ' rolled up'], '');
    return element;
}

document.body.appendChild(component());