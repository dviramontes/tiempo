import join from 'lodash.join';
import debug from 'debug';

const log = debug('app:log');
debug.enable('*');

log('logging is enabled');

function component () {
    var element = document.createElement('div');
    element.innerHTML = join(['All', ' rolled up'], '');
    return element;
}

document.body.appendChild(component());