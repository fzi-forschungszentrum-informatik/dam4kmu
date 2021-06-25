import React, { Component } from 'react'

export class Home extends Component {
    render() {
        return (
            <div>
                <div className="jumbotron">
                    <h1>DAM4KMU - ReMAn</h1>
                    <p className="lead">Welcome aboard... This is a requirement management assistent (ReMAn) web application developed by PDE-Team of FZI Karlsruhe in term of project DAM4KMU.</p>
                    <p><a href="https://www.fzi.de/en/research/projekt-details/dam4kmu-digital-assistant-for-requirements-management-for-agile-product-development-in-small-and-medium-sized-companies/" className="btn btn-primary btn-large">Learn more &raquo;</a></p>
                </div>
            </div>
        )
    }
}

export default Home
