import React, {Fragment} from 'react';
import WordForm from './WordForm';
import Words from './Words';

export default function WordDashboard() {
    return (
        <Fragment>
            <WordForm />
            <Words />
        </Fragment>
    )
}