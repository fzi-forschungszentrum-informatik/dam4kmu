import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getSentences } from '../../../actions/sentences'
import { getNLIResults } from "../../../actions/ajax";

export class RemanEntailment extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    static propTypes = {
        sentences: PropTypes.array.isRequired,
        getNLIResults: PropTypes.func.isRequired,
        nli_results: PropTypes.array.isRequired
    }

    componentDidMount() {
        this.props.getSentences();
    }

    render() {
        return (
            <Fragment>
                <h2>Potential Entailments</h2>
                <p>Found potential entailments for the following context:</p>
                <p>"{this.props.nli_results[0]["context"]}"</p>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Text</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.sentences.map((sentence) => {
                            if (this.props.nli_results[0]["entailment_ids"].includes(sentence.id))
                            return <tr key={sentence.id}>
                                <td>{sentence.id}</td>
                                <td>{sentence.text}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    sentences: state.sentences.sentences,
    nli_results: state.ajax.nli_results,
})

export default connect(mapStateToProps, {getSentences, getNLIResults})(RemanEntailment);    