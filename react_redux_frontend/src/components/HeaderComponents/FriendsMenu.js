import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import {withStyles} from '@material-ui/core/styles';
import {fetchFriendRequests, fetchUserFriends} from "../../actions/friendActions";
import 'simplebar';
import 'simplebar/dist/simplebar.css';
import Paper from "@material-ui/core/es/Paper";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import FriendMenuItem from "./FriendMenuItem";
import Grid from "@material-ui/core/Grid";
import UserSearcher from "./UserSearcher";
import Divider from "@material-ui/core/es/Divider/Divider";
import CardHeader from "@material-ui/core/es/CardHeader/CardHeader";
import Avatar from "@material-ui/core/es/Avatar/Avatar";
import SadFace from "@material-ui/icons/SentimentDissatisfiedRounded";

const styles = theme => ({
    menuBackground: {
        paddingTop: 0,
        paddingBottom: 8,
        paddingLeft: 0,
        paddingRight: 0,
        width: 400
    },
    menuItem: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12
    },
    scrollable: {
        width: 400,
        maxHeight: 400,
        padding: 0
    },
    sectionTitle: {
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 16,
        fontFamily: 'PTSansCaptionRegular',
        fontSize: 14,
        color: theme.palette.primary.main
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
    friendRequests: state.friendAccess.friendRequests,
    requestPageToken: state.friendAccess.requestPageToken,
    userSearchResults: state.users.userSearchResults,
    authToken: state.accountAccess.authToken,
    activeUserUuid: state.accountAccess.activeUser.uuid,
    updateTrigger: state.friendAccess.friendsMenuTrigger,
    friendRepo: state.friendAccess
});

class FriendsMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userSearchResults: []
        };

        this.waitToRender = false;
    }

    componentDidMount() {
        const props = this.props;
        if(props.requestPageToken === "0") {
            props.fetchFriendRequests(props.authToken, props.activeUserUuid, "0");
        }
        if(props.friendRepo[props.activeUserUuid] === undefined) {
            props.fetchUserFriends(props.authToken, props.activeUserUuid, "0");
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.userSearchResults !== prevProps.userSearchResults) {
            this.setState({
                userSearchResults: this.props.userSearchResults
            });
        }
    }

    render() {
        if(this.waitToRender) {
            this.waitToRender = false;
            return (<div/>);
        }
        const props = this.props;
        const classes = props.classes;
        const userSearchResults = this.state.userSearchResults;
        const friendRequests = props.friendRequests;

        let searchItems = null;
        if(userSearchResults.length > 0) {
            this.waitToRender = true;
            searchItems = (
                <MenuList data-simplebar className={classes.scrollable}>
                    {userSearchResults.map((result, index) => (
                        <MenuItem key={index} className={classes.menuItem}>
                            <FriendMenuItem userObject={result} type={"search"}/>
                        </MenuItem>
                    ))}
                </MenuList>
            )
        }

        let requestItems = null;
        if(friendRequests.length > 0) {
            requestItems = (
                <MenuList data-simplebar className={classes.scrollable}>
                    {friendRequests.map((request, index) => (
                        <MenuItem key={index} className={classes.menuItem}>
                            <FriendMenuItem userObject={request} type={request.type} requestKey={index}/>
                        </MenuItem>
                    ))}
                </MenuList>
            )
        } else {
            requestItems = (
                <CardHeader avatar={<Avatar className={classes.avatar} children={<SadFace style={{width: 32, height: 32}}/>}/>} title={<div className={classes.title}>No new friend requests</div>} subheader={<div className={classes.subheader}>yet...</div>}/>
            )
        }

        return (
            <React.Fragment>
                <Paper className={classes.menuBackground}>
                    <Grid container direction="column" justify="flex-start" alignContent="flex-start">
                        <div className={classes.sectionTitle}>
                            Lookup Users
                        </div>
                        <Divider/>
                        <UserSearcher/>
                        {searchItems}
                        <Divider/>
                        <div className={classes.sectionTitle}>
                            Friend Requests
                        </div>
                        <Divider/>
                        {requestItems}
                        <Divider/>
                    </Grid>
                </Paper>
            </React.Fragment>
        );
    }
}

FriendsMenu.propTypes = {
    classes: PropTypes.any.isRequired,
    friendRepo: PropTypes.object.isRequired,
    friendRequests: PropTypes.array.isRequired,
    userSearchResults: PropTypes.array.isRequired,
    activeUserUuid: PropTypes.string.isRequired,
    updateTrigger: PropTypes.bool.isRequired,
    fetchFriendRequests: PropTypes.func.isRequired,
    fetchUserFriends: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {fetchFriendRequests, fetchUserFriends}))(FriendsMenu);