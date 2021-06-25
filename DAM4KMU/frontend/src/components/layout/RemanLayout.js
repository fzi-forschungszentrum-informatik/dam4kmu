import React, { Component } from 'react'

import RemanTickets from './ReMan/RemanTickets'

export class RemanLayout extends Component {
    render() {
        return (
            <div>
                <h3><b>Realtime Search</b></h3>
                <hr className="remanBody"/>
                <RemanTickets />
                <hr className="remanBody"/>
            </div>
        )
    }
}

export default RemanLayout
