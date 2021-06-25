import React, {Fragment} from 'react';
import AssetForm from './AssetForm';
import Assets from './Assets';

export default function Dashboard() {
    return (
        <Fragment>
            <AssetForm />
            <Assets />
        </Fragment>
    )
}
