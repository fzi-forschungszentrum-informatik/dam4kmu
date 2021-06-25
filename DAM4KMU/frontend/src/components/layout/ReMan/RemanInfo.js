import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

export class RemanInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    static propTypes = {
        webInfos: PropTypes.array.isRequired
    }

    render() {

            var req_array = this.props.webInfos.length !== 0 ? this.props.webInfos[0]["recommended_sentences"]["req"] : ""
            var info_array = this.props.webInfos.length !== 0 ? this.props.webInfos[0]["recommended_sentences"]["info"] : ""
            var todo_array = this.props.webInfos.length !== 0 ? this.props.webInfos[0]["recommended_sentences"]["todo"] : ""

            return (
                <div>
                    <h3>Found the following Requirements</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Requirement</th>
                                <th>Matching Score</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {req_array.map((req, index) => (
                                <tr key={index}>
                                    <td>{req["sentence"]}</td>
                                    <td>{req["score"]}</td>
                                    <td><button onClick= {() => {
                                                     window.open(req["url"]); 
                                                    }} 
                                                className="btn btn-secondary btn-sm">Open Website
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3>Found the following Information</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Information</th>
                                <th>Matching Score</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {info_array.map((info, index) => (
                                <tr key={index}>
                                    <td>{info["sentence"]}</td>
                                    <td>{info["score"]}</td>
                                    <td><button onClick= {() => {
                                                     window.open(info["url"]); 
                                                    }} 
                                                className="btn btn-secondary btn-sm">Open Website
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h3>Found the following To Dos</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>To Do</th>
                                <th>Matching Score</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todo_array.map((todo, index) => (
                                <tr key={index}>
                                    <td>{todo["sentence"]}</td>
                                    <td>{todo["score"]}</td>
                                    <td><button onClick= {() => {
                                                     window.open(todo["url"]); 
                                                    }} 
                                                className="btn btn-secondary btn-sm">Open Website
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

    }
}

const mapStateToProps = state => ({
    webInfos: state.ajax.webInfos,
})

export default connect(mapStateToProps, null)(RemanInfo);

