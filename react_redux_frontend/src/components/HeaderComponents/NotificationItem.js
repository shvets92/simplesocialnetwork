import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import {withStyles} from '@material-ui/core/styles';
import CardHeader from "@material-ui/core/CardHeader";
import {fetchPost} from "../../actions/postActions";
import ProfilePic from "../ImageComponents/ProfilePic";

const styles = theme => ({
    notification: {
        padding: 0,
        width: 450
    },
    notificationTitle: {
        fontSize: 18,
        color: theme.palette.primary.main
    },
    avatar: {
        color: theme.palette.secondary,
        backgroundColor: theme.palette.primary,
    }
});

const mapStateToProps = state => ({
    activeUserUuid: state.accountAccess.activeUser.uuid,
    authToken: state.accountAccess.authToken
});

class NotificationItem extends Component {
    constructor(props) {
        super(props);
        let howLongAgo = Date.now() - props.notification.when;
        let happenedWhen;
        if(howLongAgo < 180000) {
            happenedWhen = 'Just now';
        } else if(howLongAgo < 3.6*10**6) {
            let mins = Math.floor(howLongAgo/60000);
            happenedWhen = mins.toString()+' min ago';
        } else if(howLongAgo < 8.64*10**7) {
            let hrs = Math.floor(howLongAgo/(3.6*10**6));
            happenedWhen = hrs.toString()+' hrs ago';
        } else if(howLongAgo < 1.728*10**8) {
            happenedWhen = 'Yesterday';
        } else {
            happenedWhen = new Date(props.notification.when).toDateString();
        }

        this.state = {
            happenedWhen: happenedWhen
        }

    }

    render() {
        const props = this.props;
        const classes = props.classes;
        const notification = props.notification;
        const notificationAvatar = (//needs to be imported from the notification object
                <ProfilePic s3ImageUri={notification.actionUserS3Uri} userFirstName={notification.actionUserFirstName}/>
        );

        const firstName = (
            <span>
                {notification.actionUserFirstName.charAt(0).toUpperCase()+notification.actionUserFirstName.substring(1)}
            </span>
        );

        let notificationTitle = (<div/>);
        switch (notification.type) {
            case "wallPost":
                notificationTitle = (
                    <div className={classes.notificationTitle}>
                        {firstName}
                        <span>
                            {" posted on your profile"}
                        </span>
                    </div>
                );
                break;
            case "postComment":
                notificationTitle = (
                    <div className={classes.notificationTitle}>
                        {firstName}
                        <span>
                            {" commented on your post"}
                        </span>
                    </div>
                );
                break;
            case "postLike":
                notificationTitle = (
                    <div className={classes.notificationTitle}>
                        {firstName}
                        <span>
                            {" liked your post"}
                        </span>
                    </div>
                );
                break;
            case "commentLike":
                notificationTitle = (
                    <div className={classes.notificationTitle}>
                        {firstName}
                        <span>
                            {" liked your comment"}
                        </span>
                    </div>
                );
                break;
            default:
                notificationTitle = (<div/>);
        }

        return (
            <div onClick={()=>props.fetchPost(notification.postUuid, notification.postOwner, props.authToken)}>
                <CardHeader className={classes.notification} avatar={notificationAvatar}
                            title={notificationTitle} subheader={this.state.happenedWhen}/>
            </div>
        );
    }
}

NotificationItem.propTypes = {
    classes: PropTypes.object.isRequired,
    activeUserUuid: PropTypes.string.isRequired,
    authToken: PropTypes.string.isRequired,
    notification: PropTypes.object
};

export default compose(withStyles(styles), connect(mapStateToProps, {fetchPost}))(NotificationItem);