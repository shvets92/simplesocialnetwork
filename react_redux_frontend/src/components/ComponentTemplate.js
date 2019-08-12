import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({});

const mapStateToProps = state => ({});

class ComponentTemplate extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const classes = this.props.classes;
        const state = this.state;
        const props = this.props;

        return (
            <div>

            </div>
        );
    }
}

ComponentTemplate.propTypes = {
    classes: PropTypes.any.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, null))(ComponentTemplate);