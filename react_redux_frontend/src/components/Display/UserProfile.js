import React, {Component} from 'react';
import PropTypes from 'prop-types';
import compose from "recompose/compose";
import {MenuList, withStyles} from "@material-ui/core";
import {fetchUserPosts} from "../../actions/postActions";
import {fetchUserProfile, saveNewBio, saveNewProfilePic} from "../../actions/userActions";
import {respondToRequest, deleteFriendRequest, sendFriendRequest, unfriend} from "../../actions/friendActions";
import {navigateTo} from "../../actions/navigationActions";
import {openPopout} from "../../actions/popoutActions";
import connect from "react-redux/es/connect/connect";
import Grid from "@material-ui/core/Grid";
import PostObject from "../PostComponents/PostObject";
import PostForm from "../PostComponents/PostForm";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/es/Card/Card";
import CardHeader from "@material-ui/core/es/CardHeader/CardHeader";
import CardContent from "@material-ui/core/es/CardContent/CardContent";
import Button from "@material-ui/core/es/Button/Button";
import AddFriendIcon from "@material-ui/icons/PersonAddRounded";
import DropIcon from '@material-ui/icons/ArrowDropDown';
import MenuItem from "@material-ui/core/es/MenuItem/MenuItem";
import Paper from "@material-ui/core/es/Paper/Paper";
import TextField from "@material-ui/core/es/TextField/TextField";
import ProfilePic from "../ImageComponents/ProfilePic";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import FriendsBox from "../UserProfileComponents/FriendsBox";

const styles = theme => ({
    postsColumn: {
        width: 500
    },
    sideColumn: {
        width: 332
    },
    nameContainer: {
        padding: 16
    },
    profileName: {
        fontFamily: 'PTSansBold',
        fontSize: 32,
        color: theme.palette.primary.main
    },
    profilePicture: {
        width: 200,
        height: 200,
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.main
    },
    bioBox: {
        width: 300
    },
    photosBox: {
        width: 300,
        padding: 0
    },
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
        height: 88
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
    addFriendButton: {
        fontFamily: 'PTSansRegular',
        fontSize: 16,
        color: theme.palette.secondary.main,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        textTransform: 'none'
    },
    addFriendIcon: {
        width: 24,
        height: 24,
        paddingRight: 4
    },
    friendsButton: {
        fontFamily: 'PTSansRegular',
        fontSize: 16,
        color: theme.palette.secondary.main,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        textTransform: 'none'
    },
    dropIcon: {
        margin: -4,
        paddingLeft: 4
    },
    greyStyle: {
        fontFamily: 'PTSansRegular',
        fontSize: 16,
        color: theme.palette.grey.A400,
        backgroundColor: theme.palette.grey["300"],
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        textTransform: 'none'
    },
    ignoredButton: {
        fontFamily: 'PTSansRegular',
        fontSize: 16,
        color: theme.palette.grey.A200,
        backgroundColor: theme.palette.grey["300"],
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        textTransform: 'none'
    },
    popoutButton: {
        fontFamily: 'PTSansRegular',
        fontSize: 16,
        textColor: theme.palette.grey.A400,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4
    },
    editButtons: {
        color: theme.palette.primary.main,
        padding: 0,
        textTransform: 'none',
        marginTop: 8,
        marginBottom: 8

    },
    textField: {
        fontFamily: 'PTSansCaptionRegular',
        fontSize: 16
    }
});

const mapStateToProps = state => ({
    authToken: state.accountAccess.authToken,
    activeUser: state.accountAccess.activeUser,
    postRepo: state.posts,
    updatePostTrigger: state.posts.updatePostTrigger,
    userProfileRepo: state.users
});

class UserProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newBioContent: '',
            editingBio: false,
            bioBoxRef: null,
            imageFile: null,
            imagePreviewUrl: ''
        };

        this.shouldFetch = false;
        this.previewingProfilePic = false;

        this.startScrollListening = this.startScrollListening.bind(this);
        this.stopScrollListening = this.stopScrollListening.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.editBio = this.editBio.bind(this);
        this.setBioBoxRef = this.setBioBoxRef.bind(this);
        this.startClickListening = this.startClickListening.bind(this);
        this.stopClickListening = this.stopClickListening.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.previewProfilePic = this.previewProfilePic.bind(this);
        this.submitProfilePic = this.submitProfilePic.bind(this);
        this.closeProfilePicPreview = this.closeProfilePicPreview.bind(this);
    }

    componentDidMount() {
        const props = this.props;
        this.shouldFetch = true;
        if(props.postRepo[props.targetUser] === undefined) {
            props.fetchUserPosts(props.targetUser, props.authToken, "0");
        }
        if(props.userProfileRepo[props.targetUser] === undefined) {
            props.fetchUserProfile(props.targetUser, props.authToken);
        }
        this.startScrollListening();
    }
    componentWillUnmount() {
        this.stopScrollListening();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.postRepo[this.props.targetUser] !== prevProps.postRepo[this.props.targetUser]) {
            if(prevProps.postRepo[this.props.targetUser] === undefined) {
                this.shouldFetch = true;
            } else if(this.props.postRepo[this.props.targetUser].pageToken === "") {
                this.shouldFetch = false;
            } else if(this.props.postRepo[this.props.targetUser].pageToken !== prevProps.postRepo[this.props.targetUser].pageToken) {
                this.shouldFetch = true;
            }
        }
        if(this.props.targetUser !== prevProps.targetUser) {
            if(this.props.postRepo[this.props.targetUser] === undefined) {
                this.props.fetchUserPosts(this.props.targetUser, this.props.authToken, "0");
            }
            if(this.props.userProfileRepo[this.props.targetUser] === undefined) {
                this.props.fetchUserProfile(this.props.targetUser, this.props.authToken);
            }
            this.shouldFetch = true;
        }
    }

    editBio = () => {
        if(this.state.editingBio) {
            this.setState({
                editingBio: false
            });
            this.stopClickListening();
        } else {
            this.setState({
                editingBio: true
            });
            this.startClickListening();
        }
    };
    setBioBoxRef = node => {
        this.setState({
            bioBoxRef: node
        })
    };
    startClickListening = () => {
        document.addEventListener('mouseup', this.handleClick, false);
    };
    stopClickListening = () => {
        document.removeEventListener('mouseup', this.handleClick, false);
    };
    handleClick = (e) => {
        if(this.state.bioBoxRef === null) {
            return;
        }

        if(!this.state.bioBoxRef.contains(e.target)) {
            this.setState({
                editingBio: false
            });
            this.stopClickListening();
            this.props.fetchUserProfile(this.props.targetUser, this.props.authToken);
        }
    };
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };
    onSubmit = (e) => {
        e.preventDefault();
        this.props.saveNewBio(this.props.authToken, this.props.activeUser.uuid, this.state.newBioContent);
        this.setState({
            editingBio: false
        });
        this.stopClickListening();
    };

    startScrollListening = () => {
        window.addEventListener('scroll', this.handleScroll, false)
    };
    stopScrollListening = () => {
        window.removeEventListener('scroll', this.handleScroll, false)
    };
    handleScroll = () => {
        if ((window.innerHeight+window.pageYOffset+400) >= document.body.offsetHeight) {
            if(this.shouldFetch && this.props.postRepo[this.props.targetUser] !== undefined) {
                this.props.fetchUserPosts(this.props.targetUser, this.props.authToken,
                    this.props.postRepo[this.props.targetUser].pageToken);
                this.shouldFetch = false;
            }
        }
    };

    previewProfilePic = (e) => {
        if (e.target.files.length > 0) {
            this.setState({
                imageFile: e.target.files[0],
                imagePreviewUrl: URL.createObjectURL(e.target.files[0])
            });
        }
        this.previewingProfilePic = true;
    };
    submitProfilePic = () => {
        const props = this.props;
        const file = this.state.imageFile;
        props.saveNewProfilePic(file, props.authToken, props.targetUser, props.activeUser.profilePic);
        this.closeProfilePicPreview();
    };
    closeProfilePicPreview = () => {
        this.previewingProfilePic = false;
        this.setState({
            imageFile: null,
            imagePreviewUrl: ''
        });
    };

    render() {
        const state = this.state;
        const props = this.props;
        const classes = props.classes;
        const targetUser = props.targetUser;
        const authToken = props.authToken;
        const activeUser = props.activeUser.uuid;
        const userProfile = props.userProfileRepo[targetUser];
        if(userProfile === undefined) {
            return (<div/>);
        }

        let postObjects;
        let pageToken;
        if(props.postRepo[targetUser] === undefined) {
            postObjects = [];
            pageToken = ""
        } else {
            postObjects = props.postRepo[targetUser].postObjects;
            pageToken = props.postRepo[targetUser].pageToken;
        }
        const posts = (
            <React.Fragment>
                {postObjects.map((post, index) => (
                    <Grid key={index} item>
                        <PostObject post={post} comments={post.comments} postKey={index}
                                    owner={props.targetUser}
                        />
                    </Grid>
                ))}
                {pageToken === "" &&
                    <div style={{minHeight: 350}}/>
                }
            </React.Fragment>
        );

        const fullName = userProfile.firstName.charAt(0).toUpperCase()+userProfile.firstName.substring(1)+" "+
            userProfile.lastName.charAt(0).toUpperCase()+userProfile.lastName.substring(1);
        let relationshipActions = null;
        switch (userProfile.relationshipStatus) {
            case "newUser":
                relationshipActions = (
                    <div>
                        <Button color="primary" variant="contained" className={classes.addFriendButton}
                                onClick={()=>props.sendFriendRequest(authToken, targetUser)}
                        >
                            <AddFriendIcon className={classes.addFriendIcon}/>
                            Add Friend
                        </Button>
                    </div>
                );
                break;
            case "youRequestedFriendShip":
                relationshipActions = (
                    <div>
                        <Button variant="contained" className={classes.greyStyle}
                                onClick={(e)=>{props.openPopout(e.currentTarget,
                                    <Paper>
                                        <MenuList>
                                            <MenuItem className={classes.popoutButton}
                                                      onClick={()=>{
                                                          props.deleteFriendRequest(authToken, activeUser, targetUser)
                                                      }}
                                            >
                                                Delete Friend Request
                                            </MenuItem>
                                        </MenuList>
                                    </Paper>
                                )}}
                        >
                            Request Sent
                            <DropIcon className={classes.dropIcon}/>
                        </Button>
                    </div>
                );
                break;
            case "theyRequestedFriendship":
                relationshipActions = (
                    <span>
                            <Button onClick={()=>props.respondToRequest(authToken, props.activeUser.uuid,
                                targetUser, "accepted")} className={classes.addFriendButton} color="primary" variant="contained">
                                <AddFriendIcon className={classes.addFriendIcon}/>
                                Add Friend
                            </Button>
                            <Button onClick={()=>props.respondToRequest(authToken, props.activeUser.uuid,
                                targetUser, "ignored")} className={classes.greyStyle} variant="contained">
                                Ignore
                            </Button>
                        </span>
                );
                break;
            case "friends":
                relationshipActions = (
                    <div>
                        <Button color="primary" variant="contained" className={classes.friendsButton}
                                onClick={(e)=>{props.openPopout(e.currentTarget,
                                    <Paper>
                                        <MenuList>
                                            <MenuItem className={classes.popoutButton}
                                                      onClick={()=>props.unfriend(authToken, targetUser)}
                                            >
                                                Unfriend
                                            </MenuItem>
                                        </MenuList>
                                    </Paper>
                                )}}
                        >
                            Friends
                            <DropIcon className={classes.dropIcon}/>
                        </Button>
                    </div>
                );
                break;
            case "ignored":
                relationshipActions = (
                    <div>
                        <Button variant="contained" className={classes.ignoredButton}
                                onClick={(e)=>{props.openPopout(e.currentTarget,
                                    <Paper>
                                        <MenuList>
                                            <MenuItem className={classes.popoutButton}
                                                      onClick={()=>props.respondToRequest(authToken,
                                                          props.activeUser.uuid, targetUser, "accepted")}
                                            >
                                                Accept Friend Request
                                            </MenuItem>
                                        </MenuList>
                                    </Paper>
                                )}}
                        >
                            Ignored
                            <DropIcon className={classes.dropIcon}/>
                        </Button>
                    </div>
                );
                break;
            default:

        }


        let profilePicture = (
            <ProfilePic styleOverride={classes.profilePicture} userFirstName={userProfile.firstName} userUuid={targetUser} s3ImageUri={userProfile.profilePicUri}/>
        );
        if(targetUser === props.activeUser.uuid) {
            profilePicture = (
                <div>
                    <input style={{display: 'none'}} type="file" name="postImage" accept=".jpg, .jpeg, .png"
                           onChange={this.previewProfilePic} ref={fileInput => this.fileInput = fileInput}
                    />
                    <div onClick={()=>this.fileInput.click()}>
                        <ProfilePic styleOverride={classes.profilePicture}
                                    userFirstName={userProfile.firstName} userUuid={targetUser}
                                    s3ImageUri={userProfile.profilePicUri} clickable={false}
                                    noPicOverrideMessage={"Click here to set a picture"}
                        />
                    </div>
                </div>
            );
            if(state.imagePreviewUrl !== '') {
                profilePicture = (
                    <Avatar className={classes.profilePicture} src={state.imagePreviewUrl}/>
                )
            }
        }

        let editBioButton = (<div/>);
        if(targetUser === activeUser) {
            editBioButton = (
                <Button variant="contained" className={classes.editButtons} onClick={this.editBio}>
                    Edit
                </Button>
            );
        }
        const bioBox = (
            <div ref={this.setBioBoxRef}>
                <Card className={classes.bioBox}>
                    <CardHeader title={'Bio'} action={editBioButton}/>
                    {
                        state.editingBio ?
                            (
                                <div>
                                    <TextField className={classes.textField} placeholder="What's up?" multiline={true}
                                               fullWidth={true} variant="outlined" autoFocus={true} rowsMax={6}
                                               maxLength={500} name="newBioContent" onChange={this.onChange}
                                               value={state.newBioContent}
                                    />
                                    <Grid container direction="column" alignContent="center">
                                        <Button variant="contained"  className={classes.editButtons} onClick={this.onSubmit}>
                                            Submit
                                        </Button>
                                    </Grid>
                                </div>

                            ):(
                                <CardContent className={classes.textField}>
                                    {userProfile.bio}
                                </CardContent>
                            )
                    }
                </Card>
            </div>
        );
        // Gallery is temporarily disabled
        // const photosBox = (
        //     <Card className={classes.photosBox}>
        //         <CardHeader className={classes.boxHeader} title={'Photos'}/>
        //         <CardContent className={classes.boxContent}>
        //             <Grid container spacing={8} direction="row" justify="center" alignItems="center">
        //                 {[1,2,3,4,5,6,7,8,9].map(id => (
        //                     <Grid key={id} item className={classes.boxPicItemContainer}>
        //                         <img src={profilePic} className={classes.boxPicItem}/>
        //                     </Grid>
        //                 ))}
        //             </Grid>
        //         </CardContent>
        //     </Card>
        // );

        const friendsBox = (
            <FriendsBox targetUser={props.targetUser} targetFirstName={userProfile.firstName}/>
        );

        return (
            <div>
                <Dialog open={this.previewingProfilePic} onClose={this.closeProfilePicPreview}>
                    <DialogTitle>Would you like this as your profile picture?</DialogTitle>
                    <Button onClick={this.submitProfilePic}>Yes</Button>
                    <Button onClick={this.closeProfilePicPreview} color="primary">No</Button>
                </Dialog>
                <Grid item container direction="row" justify="center" alignItems="flex-start" >
                    <Grid item container spacing={8} className={classes.sideColumn}
                          direction="column" justify="flex-start" alignItems="center" >
                        <Grid item>
                            {profilePicture}
                        </Grid>
                        <Grid item>
                            {bioBox}
                        </Grid>
                        <Grid item>
                            {friendsBox}
                        </Grid>
                    </Grid>
                    <Grid item container className={classes.postsColumn}
                          direction="column" justify="flex-start" alignItems="center" >
                        <Grid item container className={classes.nameContainer} direction="row" justify="center" alignItems="center">
                            <Grid item className={classes.profileName}>
                                {fullName}
                            </Grid>
                            <Grid item xs/>
                            <Grid item>
                                {relationshipActions}
                            </Grid>
                        </Grid>
                        <PostForm targetUser={props.targetUser}/>
                        {posts}
                    </Grid>
                    <Grid item container spacing={8} className={classes.sideColumn}
                          direction="column" justify="flex-start" alignItems="center"
                    />
                </Grid>
            </div>
        );
    }
}

UserProfile.propTypes = {
    classes: PropTypes.any.isRequired,
    fetchUserPosts: PropTypes.func.isRequired,
    fetchUserProfile: PropTypes.func.isRequired,
    sendFriendRequest: PropTypes.func.isRequired,
    deleteFriendRequest: PropTypes.func.isRequired,
    respondToRequest: PropTypes.func.isRequired,
    unfriend: PropTypes.func.isRequired,
    openPopout: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired,
    saveNewBio: PropTypes.func.isRequired,
    authToken: PropTypes.string.isRequired,
    activeUser: PropTypes.object.isRequired,
    updatePostTrigger: PropTypes.bool.isRequired,
    targetUser: PropTypes.string.isRequired,
    postRepo: PropTypes.object.isRequired,
    userProfileRepo: PropTypes.object,
    saveNewProfilePic: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps,
    {
        saveNewBio, unfriend, sendFriendRequest, openPopout, fetchUserPosts, fetchUserProfile, deleteFriendRequest,
        respondToRequest, navigateTo, saveNewProfilePic
    }
    ))(UserProfile);