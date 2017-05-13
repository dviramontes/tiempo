import _ from 'lodash';

function component () {
    var element = document.createElement('div');
    element.innerHTML = _.join(['All', ' rolled up'], '');
    return element;
}

document.body.appendChild(component());