import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Paper from "@material-ui/core/es/Paper";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import {logout} from "../../actions/accountAccessActions";
import {navigateTo} from "../../actions/navigationActions";

const styles = theme => ({
    menuBackground: {
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 0,
        paddingRight: 0,
        maxWidth: 200
    }
});

const mapStateToProps = state => ({});

class OptionsMenu extends Component {
    constructor(props) {
        super(props);

        this.logout = this.logout.bind(this);
    };

    logout = () => {
        this.props.logout();
        this.props.navigateTo('login');
    };

    render() {
        return (
            <React.Fragment>
                <Paper className={this.props.classes.menuBackground}>
                    <MenuList>
                        {/*<MenuItem>Settings</MenuItem>*/}
                        {/*<MenuItem>About Simple Social</MenuItem>*/}
                        <MenuItem onClick={this.logout}>Logout</MenuItem>
                    </MenuList>
                </Paper>
            </React.Fragment>
        );
    }
}

OptionsMenu.propTypes = {
    classes: PropTypes.any.isRequired,
    logout: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {logout, navigateTo}))(OptionsMenu);