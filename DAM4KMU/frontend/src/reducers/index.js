import {combineReducers} from 'redux';
import assets from './assets';
import errors from './errors';
import messages from './messages';
import projects from './projects';
import relations from './relations';
import requirements from './requirements';
import components from './components';
import sentences from './sentences';
import words from './words';
import tasks from './tasks';
import ajax from './ajax';

export default combineReducers({
    assets,
    errors,
    messages,
    projects,
    relations,
    requirements,
    components,
    sentences,
    words,
    tasks,
    ajax
});