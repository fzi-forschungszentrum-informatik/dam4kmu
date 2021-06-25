import React, {Fragment} from 'react';
import RelationForm from './RelationForm';
import Relations from './Relations';

export default function RelationDashboard() {
    return (
        <Fragment>
            <RelationForm />
            <Relations />
        </Fragment>
    )
}