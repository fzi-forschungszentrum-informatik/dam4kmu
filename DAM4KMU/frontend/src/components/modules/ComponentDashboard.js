import React, {Fragment} from 'react';
import ComponentForm from './ComponentForm';
import Components from './Components';

export default function ComponentDashboard() {
    return (
        <Fragment>
            <ComponentForm />
            <Components />
        </Fragment>
    )
}