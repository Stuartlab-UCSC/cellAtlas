

// The result page.

import React from 'react'
import { connect } from 'react-redux'

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ResultTable from 'result/ResultTable'
import MockUp from 'app/MockUp'

const ResultPres = ({classes}) => {
    return (
        <Grid container spacing={16}
            className='pageBody'
        >
            <Grid item xs={12}>
                <Typography variant='title'>
                    Analysis Results
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <ResultTable />
            </Grid>
            <MockUp />
        </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        classes: {
            title: 'title',
        },
    }
}

const Result = connect(
    mapStateToProps
)(ResultPres)

export default Result
