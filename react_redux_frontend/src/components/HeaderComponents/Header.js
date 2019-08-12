import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {navigateTo} from "../../actions/navigationActions";
import {openPopout} from "../../actions/popoutActions";
import {updateActiveUser} from "../../actions/accountAccessActions";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import Grid from '@material-ui/core/Grid';
import NotificationsIcon from '@material-ui/icons/Notifications';
import FriendsIcon from '@material-ui/icons/People';
import DropIcon from '@material-ui/icons/ArrowDropDown';

import logo from '../../static/Simple Social Network.svg';
import OptionsMenu from './OptionsMenu';
import NotificationsMenu from "./NotificationsMenu";
import FriendsMenu from "./FriendsMenu";
import ProfilePic from "../ImageComponents/ProfilePic";
import compose from "recompose/compose";
import {withStyles} from "@material-ui/core";
import yellow from "@material-ui/core/colors/yellow";
import deepPurple from "@material-ui/core/colors/deepPurple";

const styles = {
    headerStyles: {
        minWidth: 500,
        maxWidth: 1100,
        padding: 0
    },
    logoButton: {
        width: 200,
        borderRadius: 16,
        padding: 8
    },
    dropIcon: {
        padding: 0,
        margin: 5,
        backgroundColor: 'transparent'
    },
    icon: {
        margin: 5
    },
    chatIcon: {
        width: 24,
        height: 22,
        marginBottom: 1,
        marginTop: 1
    },
    userFirstName: {
        paddingLeft: 5
    },
    homeButton: {
        height: 45,
        margin: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    userAvatar: {
        maxWidth: 30,
        maxHeight: 30,
        color: yellow[500],
        backgroundColor: deepPurple[500]
    }
};

const mapStateToProps = state => ({
    accountCreated: state.accountAccess.accountCreated,
    isLoggedIn: state.accountAccess.isLoggedIn,
    authToken: state.accountAccess.authToken,
    activeUser: state.accountAccess.activeUser,
    updates: state.accountAccess.updates
});

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userFirstName: '',
            loggedIn: false,
            numOfNewFriendRequests: 0,
            numOfNewNotifications: 0
        };

        this.intervalVar = null;

        this.openFriendsFinder = this.openFriendsFinder.bind(this);
        this.openNotifications = this.openNotifications.bind(this);
        this.goHome = this.goHome.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const props = this.props;

        if(prevProps.accountCreated !== props.accountCreated) {
            if(props.accountCreated) {
                props.navigateTo('login');
            }
        }
        if(prevProps.isLoggedIn !== props.isLoggedIn) {
            if(props.isLoggedIn) {
                //render the user icons header
                this.setState({
                    loggedIn: true,
                    userFirstName: this.props.activeUser.firstName
                });
                props.navigateTo(props.activeUser.uuid);
                //do fetch update from here
                props.updateActiveUser(props.authToken, props.activeUser.uuid);
                this.intervalVar = setInterval(()=>props.updateActiveUser(props.authToken, props.activeUser.uuid), 60000);
            } else {
                //render the login header
                this.setState({
                    loggedIn: false
                }, ()=>{
                    props.navigateTo('login');
                });
                if(this.intervalVar !== null) {
                    clearInterval(this.intervalVar);
                    this.intervalVar = null;
                }
            }
        }
        if(props.updates !== prevProps.updates) {
            if(props.updates.numOfNewFriendRequests !== undefined) {
                this.setState({
                    numOfNewFriendRequests: this.props.updates.numOfNewFriendRequests,
                    numOfNewNotifications: this.props.updates.numOfNewNotifications
                });
            } else {
                this.setState({
                    numOfNewFriendRequests: 0,
                    numOfNewNotifications: 0
                });
            }
        }

    }

    openFriendsFinder = (e) => {
        this.props.openPopout(e.currentTarget, <FriendsMenu/>, 80);
        this.setState({
            numOfNewFriendRequests: 0
        })
    };
    openNotifications = (e) => {
        this.props.openPopout(e.currentTarget, <NotificationsMenu/>, 33);
        this.setState({
            numOfNewNotifications: 0
        })
    };
    goHome = () => {
        if(this.props.isLoggedIn) {
            this.props.navigateTo('home');
        } else {
            this.props.navigateTo('login');
        }
    };

    render() {
        const state = this.state;
        const props = this.props;

        const renderLogin = (
            <React.Fragment>
                <Grid item container xs={3} justify="flex-end" alignItems="center">
                    <Button onClick={()=> {
                        props.navigateTo('login')
                    }} size="medium" color="inherit">Login</Button>
                </Grid>
                <Grid item container xs={3} justify="flex-start" alignItems="center">
                    <Button onClick={()=> {
                        props.navigateTo('create_account')
                    }} size="medium" color="inherit">Join</Button>
                </Grid>
            </React.Fragment>
        );

        let renderUserIcons = (<div/>);
        if(props.activeUser !== null) {
            renderUserIcons = (
                <React.Fragment>
                    <Grid item container xs={3} justify="flex-end" alignItems="center">
                        <Grid item>
                            <Button onClick={()=>{
                                props.navigateTo(props.activeUser.uuid)
                            }} style={styles.homeButton} color="inherit">
                                <ProfilePic s3ImageUri={props.activeUser.profilePic} userFirstName={props.activeUser.firstName} styleOverride={props.classes.userAvatar} noButton={true}/>
                                <Typography style={styles.userFirstName} color="inherit">
                                    {state.userFirstName}
                                </Typography>
                            </Button>
                            <Button onClick={() => {
                                props.navigateTo('home')
                            }} style={styles.homeButton} size="medium" color="inherit">
                                <Typography color="inherit">
                                    Home
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item container xs={3} justify="flex-start" alignItems="center">
                        <Grid item>
                            <IconButton onClick={this.openFriendsFinder} style={styles.icon} color="inherit">
                                <Badge badgeContent={state.numOfNewFriendRequests} color="secondary">
                                    <FriendsIcon />
                                </Badge>
                            </IconButton>
                        </Grid>
                        {/*Chat functionality is disabled for now*/}
                        {/*<Grid item>*/}
                        {/*    <IconButton onClick={(e)=>{*/}
                        {/*        props.openPopout(e.currentTarget, <NotificationsMenu/>, 76)*/}
                        {/*    }} style={styles.icon} color="inherit">*/}
                        {/*        <Badge badgeContent={4} color="secondary">*/}
                        {/*            <img src={chatIcon} alt="chat" style={styles.chatIcon}/>*/}
                        {/*        </Badge>*/}
                        {/*    </IconButton>*/}
                        {/*</Grid>*/}
                        <Grid item>
                            <IconButton onClick={this.openNotifications} style={styles.icon} color="inherit">
                                <Badge badgeContent={state.numOfNewNotifications} color="secondary">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={(e)=>{
                                props.openPopout(e.currentTarget, <OptionsMenu/>)
                            }} style={styles.dropIcon} color="secondary">
                                <DropIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </React.Fragment>
            );
        }

        return (
            <div>
                <AppBar>
                    <Toolbar>
                        <Grid item container direction="row" justify="center" alignItems="center" >
                            <Grid item container spacing={0}  style={styles.headerStyles} direction="row" justify="center" alignItems="center">
                                <Grid item xs x1={2}/>
                                <Grid item xs={2}>
                                    <IconButton onClick={this.goHome} style={styles.logoButton}>
                                        <img src={logo} alt="Logo"/>
                                    </IconButton>
                                </Grid>
                                <Grid item xs x1={2}/>

                                {state.loggedIn ? (renderUserIcons):(renderLogin)}
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

Header.propTypes = {
    classes: PropTypes.any.isRequired,
    navigateTo: PropTypes.func.isRequired,
    accountCreated: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    authToken: PropTypes.string,
    openPopout: PropTypes.func.isRequired,
    activeUser: PropTypes.object,
    updates: PropTypes.object.isRequired,
    updateActiveUser: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {updateActiveUser, navigateTo, openPopout}))(Header);