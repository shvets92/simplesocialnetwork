import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({});

const mapStateToProps = state => ({});

class ChatMenu extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <React.Fragment>

            </React.Fragment>
        );
    }
}

ChatMenu.propTypes = {
    classes: PropTypes.any.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, null))(ChatMenu);