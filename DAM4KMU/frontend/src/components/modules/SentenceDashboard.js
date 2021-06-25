import React, {Fragment} from 'react';
import SentenceForm from './SentenceForm';
import Sentences from './Sentences';

export default function SentenceDashboard() {
    return (
        <Fragment>
            <SentenceForm />
            <Sentences />
        </Fragment>
    )
}