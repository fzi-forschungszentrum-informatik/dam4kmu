import React, {Fragment} from 'react';
import RequirementForm from './RequirementForm';
import Requirements from './Requirements';

// Maybe we don't need this dashboard later because for requirement we have wizard already only for testing purpose
export default function RequirementDashboard() {
    return (
        <Fragment>
            <RequirementForm />
            <Requirements />
        </Fragment>
    )
}