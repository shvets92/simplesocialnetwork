import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import CardHeader from "@material-ui/core/es/CardHeader";
import CardContent from "@material-ui/core/es/CardContent";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/es/Card";
import {fetchUserFriends} from "../../actions/friendActions";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import Button from "@material-ui/core/es/Button/Button";
import ProfilePic from "../ImageComponents/ProfilePic";
import 'simplebar';
import 'simplebar/dist/simplebar.css';
import MenuItem from "@material-ui/core/MenuItem";
import FriendMenuItem from "../HeaderComponents/FriendMenuItem";
import MenuList from "@material-ui/core/MenuList";

const styles = theme => ({
    friendsBox: {
        width: 300,
        padding: 0
    },
    boxPicItemContainer: {
        width: 92,
        height: 92
    },
    boxPicItem: {
        width: 88,
        height: 88,
        borderRadius: 0,
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.main
    },
    boxHeader: {
        paddingTop: 12,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 0
    },
    boxContent: {
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8
    },
    openMenuButton: {
        color: theme.palette.primary.main,
        padding: 0,
        textTransform: 'none',
        marginTop: 8,
        marginBottom: 8
    },
    seeMoreFriendsButton: {
        color: theme.palette.primary.main,
        padding: 0,
        textTransform: 'none'
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
    menuTitle: {
        color: theme.palette.primary.main
    }
});

const mapStateToProps = state => ({
    friendsRepo: state.friendAccess,
    authToken: state.accountAccess.authToken
});

class FriendsBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openMenu: false
        };

        this.openMenu = this.openMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }
    componentDidMount() {
        const props = this.props;
        if(props.friendsRepo[props.targetUser] === undefined) {
            props.fetchUserFriends(props.authToken, props.targetUser, "0");
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        const props = this.props;
        if(props.targetUser !== prevProps.targetUser) {
            if(props.friendsRepo[props.targetUser] === undefined) {
                props.fetchUserFriends(props.authToken, props.targetUser, "0");
            }
        }
    }

    openMenu = () => {
        this.setState({
            openMenu: true
        })
    };
    closeMenu = () => {
        this.setState({
            openMenu: false
        })
    };

    render() {
        const classes = this.props.classes;
        const state = this.state;
        const props = this.props;
        if(props.friendsRepo[props.targetUser] === undefined) {
            return (<div/>);
        }
        const friendObjects = props.friendsRepo[props.targetUser].friends;
        let shortArray = [...friendObjects];
        let sliceMax = shortArray.length;
        if(sliceMax > 9) {
            sliceMax = 9;
        }

        const openMenuButton = (
            <Button onClick={this.openMenu} variant="contained" className={classes.openMenuButton}>
                See All
            </Button>
        );
        let seeMoreFriendsButton = (
            <Button variant="contained" className={classes.seeMoreFriendsButton}
                    onClick={()=>props.fetchUserFriends(props.authToken, props.targetUser,
                                                        props.friendsRepo[props.targetUser].pageToken)}
            >
                Show More Friends
            </Button>
        );
        if(props.friendsRepo[props.targetUser].pageToken === "") {
            seeMoreFriendsButton = (<div style={{height: 24}}/>);
        }

        return (
            <div>
                <Card className={classes.friendsBox}>
                    <CardHeader className={classes.boxHeader} title={'Friends'} action={openMenuButton}/>
                    <CardContent className={classes.boxContent}>
                        <Grid container spacing={8} direction="row" justify="center" alignItems="center">
                            {shortArray.slice(0, sliceMax).map((friendObject, index) => (
                                <Grid key={index} item className={classes.boxPicItemContainer}>
                                    <ProfilePic styleOverride={classes.boxPicItem} userUuid={friendObject.userUuid}
                                                userFirstName={friendObject.firstName}
                                                s3ImageUri={friendObject.profilePicUri}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
                <Dialog open={state.openMenu} onClose={this.closeMenu}>
                    <DialogTitle>
                        {
                            props.targetFirstName.charAt(0).toUpperCase()+
                            props.targetFirstName.substring(1)+ "'s Friends"
                        }
                    </DialogTitle>
                    <div data-simplebar className={classes.scrollable}>
                        <MenuList >
                            {friendObjects.map((friendObject, index) => (
                                <MenuItem key={index} className={classes.menuItem}>
                                    <FriendMenuItem userObject={friendObject} type={friendObject.type}/>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </div>
                    {seeMoreFriendsButton}
                </Dialog>
            </div>
        );
    }
}

FriendsBox.propTypes = {
    classes: PropTypes.any.isRequired,
    fetchUserFriends: PropTypes.func.isRequired,
    friendsRepo: PropTypes.object.isRequired,

    targetUser: PropTypes.string.isRequired,
    targetFirstName: PropTypes.string.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {fetchUserFriends}))(FriendsBox);