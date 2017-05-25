import join from 'lodash.join';
import '../main.less';

function component () {
    const element = document.createElement('div');
    element.innerHTML = join(['All', ' rolled up!'], '');
    return element;
}

document.body.appendChild(component());