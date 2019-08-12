import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import NotificationItem from "./NotificationItem";

import {withStyles} from '@material-ui/core/styles';

import Paper from "@material-ui/core/es/Paper/Paper";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";

import 'simplebar';
import 'simplebar/dist/simplebar.css';

import {fetchNotifications} from "../../actions/accountAccessActions";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/es/Avatar";
import SadFace from "@material-ui/icons/SentimentDissatisfiedRounded";
import CardHeader from "@material-ui/core/es/CardHeader";

const styles = theme => ({
    menuBackground: {
        width: 450,
        maxHeight: 400
    },
    menuItem: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    scrollable: {
        width: 450,
        maxHeight: 400,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 0,
        paddingRight: 0,
    },
    loadMoreNotificationsButton: {
        cursor: "pointer",
        fontFamily: 'PTSansCaptionBold',
        fontSize: 14,
        color: theme.palette.primary["500"],
        paddingTop: 4,
        paddingBottom: 4
    },
    title: {
        cursor: "pointer",
        paddingTop: 0,
        marginBottom: -4,
        fontFamily: 'PTSansCaptionBold',
        fontSize: 16,
        color: theme.palette.grey["500"]
    },
    subheader: {
        fontFamily: 'PTSanseCaptionRegular',
        fontSize: 16,
        marginTop: -6,
        color: theme.palette.primary.main
    },
    avatar: {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.grey["500"],
        marginRight: -8
    }
});

const mapStateToProps = state => ({
    notifications: state.accountAccess.notifications,
    notificationsPageToken: state.accountAccess.notificationsPageToken,
    activeUserUuid: state.accountAccess.activeUser.uuid,
    authToken: state.accountAccess.authToken
});

class NotificationsMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trigger: false
        };

        this.waitToRender = props.notifications.length === 0 && props.notificationsPageToken !== "";
        this.waitForTrigger = false;
        this.fetchNotifications = this.fetchNotifications.bind(this);
    }

    componentDidMount() {
        const props = this.props;
        if(props.notifications.length === 0 && props.notificationsPageToken !== "") {
            props.fetchNotifications(props.authToken, props.activeUserUuid, props.notificationsPageToken);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.waitForTrigger) {
            this.waitForTrigger = false;
            this.setState({
                trigger: !this.state.trigger
            })
        }
    }

    fetchNotifications = () => {
        const props = this.props;
        this.waitForTrigger = true;
        this.waitToRender = true;
        props.fetchNotifications(props.authToken, props.activeUserUuid, props.notificationsPageToken);
    };

    render() {
        const props = this.props;
        const classes = props.classes;

        if(this.waitToRender) {
            this.waitToRender = false;
            return (
                <Paper className={classes.menuBackground}/>
            );
        }
        let notificationsItems;
        if(props.notifications.length === 0) {
            notificationsItems = (
                <CardHeader avatar={<Avatar className={classes.avatar} children={<SadFace style={{width: 32, height: 32}}/>}/>} title={<div className={classes.title}>No notifications</div>} subheader={<div className={classes.subheader}>so far...</div>}/>
            )
        } else {
            notificationsItems = (
                <MenuList data-simplebar className={classes.scrollable}>
                    {props.notifications.map((notification, index) => (
                        <MenuItem key={index} className={classes.menuItem}>
                            <NotificationItem notification={notification}/>
                        </MenuItem>
                    ))}
                    {
                        props.notificationsPageToken !== "" &&
                        <Grid item container direction="row" justify="center" className={classes.loadMoreNotificationsButton} onClick={this.fetchNotifications}>
                            {"Load More Notifications"}
                        </Grid>
                    }
                </MenuList>
            )
        }

        return (
            <Paper className={classes.menuBackground}>
                {notificationsItems}
            </Paper>
        );
    }
}

NotificationsMenu.propTypes = {
    classes: PropTypes.object.isRequired,
    notifications: PropTypes.array.isRequired,
    notificationsPageToken: PropTypes.string.isRequired,
    activeUserUuid: PropTypes.string.isRequired,
    authToken: PropTypes.string.isRequired,
    fetchNotifications: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {fetchNotifications}))(NotificationsMenu);