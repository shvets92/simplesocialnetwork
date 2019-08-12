import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import {withStyles} from '@material-ui/core/styles';
import {navigateTo} from "../../actions/navigationActions";
import {respondToRequest} from "../../actions/friendActions";

import CardHeader from "@material-ui/core/CardHeader";
import deepPurple from "@material-ui/core/colors/deepPurple";
import Button from "@material-ui/core/es/Button/Button";
import ProfilePic from "../ImageComponents/ProfilePic";

const styles = theme => ({
        mainContainer: {
            padding: 0,
            width: 400
        },
        title: {
            cursor: "pointer",
            paddingTop: 0,
            marginBottom: -4,
            fontFamily: 'PTSansCaptionBold',
            fontSize: 16,
            color: deepPurple[500]
        },
        subheader: {
            fontFamily: 'PTSanseCaptionRegular',
            fontSize: 16,
            marginTop: -6
        },
        avatar: {
            color: theme.palette.secondary.main,
            backgroundColor: theme.palette.primary.main,
            marginRight: -8
        },
        acceptButton: {
            color: theme.palette.secondary.main,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
            textTransform: 'none'
        },
        ignoreButton: {
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
            textTransform: 'none',
            backgroundColor: theme.palette.grey["300"],
            color: theme.palette.grey.A400
        },
        actionsContainer: {
            marginTop: 12,
        }
    });

const mapStateToProps = state => ({
    authToken: state.accountAccess.authToken,
    activeUserUuid: state.accountAccess.activeUser.uuid
});

class FriendMenuItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonRef: null
        };
        this.setButtonRef = this.setButtonRef.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    setButtonRef = node => {
        this.setState({
            buttonRef: node
        })
    };
    handleClick = (e) => {
        let userUuid = this.props.userObject.userUuid;
        if(this.state.buttonRef === null) {
            this.props.navigateTo(userUuid);
            return;
        }
        if(!this.state.buttonRef.contains(e.target)) {
            this.props.navigateTo(userUuid);
        }
    };

    render() {
        const classes = this.props.classes;
        const user = this.props.userObject;

        // const avatar = (
        //     <Avatar className={classes.avatar}>
        //         {user.firstName.charAt(0).toUpperCase()+user.lastName.charAt(0).toUpperCase()}
        //     </Avatar>
        // );
        const avatar = (
            <ProfilePic s3ImageUri={user.profilePicUri} userUuid={user.userUuid} userFirstName={user.firstName}/>
        );
        const title = (
            <div className={classes.title}>
                {user.firstName.charAt(0).toUpperCase()+user.firstName.substring(1)+" "+
                user.lastName.charAt(0).toUpperCase()+user.lastName.substring(1)}
            </div>
        );

        let subheader = null;
        if(this.props.type !== 'friend') {
            subheader = (
                <div className={classes.subheader}>
                    {user.numOfMutualFriends+" mutual friends"}
                </div>
            );
        } else {
            subheader = (
                <div className={classes.subheader}>
                    {"Friends since "+new Date(user.since).toDateString()}
                </div>
            );
        }

        let requestActions;
        switch (this.props.type) {
            case "request":
                requestActions = (
                    <div className={classes.actionsContainer}>
                        <span ref={this.setButtonRef}>
                            <Button onClick={()=>this.props.respondToRequest(this.props.authToken, this.props.activeUserUuid,
                                user.userUuid, "accepted", this.props.requestKey)} className={classes.acceptButton}
                                    color="primary" variant="contained">
                                Accept
                            </Button>
                            <Button onClick={()=>this.props.respondToRequest(this.props.authToken, this.props.activeUserUuid,
                                user.userUuid, "ignored", this.props.requestKey)} className={classes.ignoreButton}
                                    variant="contained">
                                Ignore
                            </Button>
                        </span>
                    </div>
                );
                break;
            case "accepted":
                requestActions = (
                    <div className={classes.actionsContainer}>
                        <Button className={classes.acceptButton} disabled={true} color="primary" variant="contained">
                            Accepted
                        </Button>
                    </div>
                );
                break;
            case "ignored":
                requestActions = (
                    <div className={classes.actionsContainer}>
                        <Button className={classes.ignoreButton} disabled={true} variant="contained">
                            Ignored
                        </Button>
                    </div>
                );
                break;
            default:
                requestActions = null;
        }

        return (
            <React.Fragment>
                <CardHeader onClick={(e)=>this.handleClick(e)} className={classes.mainContainer} avatar={avatar}
                            title={title} subheader={subheader} action={requestActions}/>
            </React.Fragment>
        );
    }
}

FriendMenuItem.propTypes = {
    classes: PropTypes.any.isRequired,
    authToken: PropTypes.string.isRequired,
    activeUserUuid: PropTypes.string.isRequired,
    navigateTo: PropTypes.func.isRequired,
    respondToRequest: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    userObject: PropTypes.object.isRequired,
    requestKey: PropTypes.number
};

export default compose(withStyles(styles), connect(mapStateToProps, {navigateTo, respondToRequest}))(FriendMenuItem);