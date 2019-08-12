import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import CommentsIcon from '@material-ui/icons/CommentRounded';
import Grow from '@material-ui/core/Grow';
import deepPurple from "@material-ui/core/colors/deepPurple";
import yellow from "@material-ui/core/colors/yellow";
import connect from "react-redux/es/connect/connect";
import Paper from "@material-ui/core/es/Paper/Paper";
import CommentForm from "./CommentForm";
import compose from "recompose/compose";
import {withStyles} from "@material-ui/core";
import CommentObject from "./CommentObject";
import {fetchPostComments, likePost, unlikePost} from "../../actions/postActions";
import {navigateTo} from "../../actions/navigationActions";
import Badge from "@material-ui/core/es/Badge/Badge";
import {fetchImage} from "../../actions/imageActions";
import ProfilePic from "../ImageComponents/ProfilePic";

const styles = theme => ({
    postContainer: {
        width: 500,
        paddingTop: 0,
        paddingBottom: 0
    },
    postTitle: {
        cursor: "pointer",
        paddingTop: 0,
        marginBottom: -10,
        fontFamily: 'PTSansCaptionBold',
        fontSize: 18,
        color: deepPurple[500]
    },
    postHeader: {
        marginTop: 0,
        paddingBottom: 0
    },
    postBody: {
        paddingTop: 4,
        paddingBottom: 4
    },
    postFooter: {
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 0
    },
    postOptions: {
        padding: 4,
        background: "transparent"
    },
    avatar: {
        color: yellow[500],
        backgroundColor: deepPurple[500]
    },
    avatarButton: {
        padding: 0
    },
    actionButton: {
        padding: 8,
        background: "transparent"
    },
    middleIconSpace: {
        flexGrow: 1,
        minWidth: 100
    },
    sideIconSpace: {
        width: 100
    },
    textBodyFont: {
        fontFamily: 'PTSansCaptionRegular',
        fontSize: 16
    },
    textSubheaderFont: {
        fontFamily: 'PTSanseCaptionRegular',
        fontSize: 14,
        paddingTop: 4
    },
    innerContainer: {
        zIndex: 10,
        position: 'relative'
    },
    commentsContainer: {
        backgroundColor: theme.palette.primary["50"],
        paddingTop: 16,
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 0,
        width: 500,
        maxHeight: 350
    },
    commentsSection: {
        zIndex: 0,
        position: 'relative',
        bottom: 8
    },
    commentSectionItem: {
        paddingTop: 4,
        paddingBottom: 0
    },
    shareIcon: {
        marginRight: 4
    },
    moreCommentsButton: {
        cursor: "pointer",
        fontFamily: 'PTSansCaptionBold',
        fontSize: 14,
        color: deepPurple[500],
        paddingTop: 4,
        paddingBottom: 4
    },
    commentsIcon: {
        maxWidth: 20,
        maxHeight: 20
    }
});

const mapStateToProps = state => ({
    authToken: state.accountAccess.authToken,
    activeUser: state.accountAccess.activeUser,
    updatePostTrigger: state.posts.updatePostTrigger,
    imageRepo: state.images
});

class PostObject extends Component {
    constructor(props) {
        super(props);
        let liked = false;
        if(!(props.post.liked == null)) {
            liked = props.post.liked
        }
        let howLongAgo = Date.now() - props.post.when;
        let whenPosted;
        if(howLongAgo < 180000) {
            whenPosted = 'Just now';
        } else if(howLongAgo < 3.6*10**6) {
            let mins = Math.floor(howLongAgo/60000);
            whenPosted = mins.toString()+' min ago';
        } else if(howLongAgo < 8.64*10**7) {
            let hrs = Math.floor(howLongAgo/(3.6*10**6));
            whenPosted = hrs.toString()+' hrs ago';
        } else if(howLongAgo < 1.728*10**8) {
            whenPosted = 'Yesterday';
        } else {
            whenPosted = new Date(props.post.when).toDateString();
        }

        let numOfLikes = 0;
        if(props.post.numOfLikes !== undefined) {
            numOfLikes = props.post.numOfLikes;
        }

        let numOfComments = 0;
        if(props.post.numOfComments !== undefined) {
            numOfComments = props.post.numOfComments;
        }

        let commentPageToken = "0";
        if(props.post.commentPageToken !== undefined) {
            commentPageToken = props.post.commentPageToken;
        }

        this.state = {
            activeUserLiked: liked,
            whenPosted: whenPosted,
            numOfLikes: numOfLikes,
            numOfComments: numOfComments,
            commentPageToken: commentPageToken,
            showComments: false,
            localImgUrl: null
        };

        this.commentFetching = false;

        this.toggleLike = this.toggleLike.bind(this);
        this.fetchComments = this.fetchComments.bind(this);
        this.updatePostState = this.updatePostState.bind(this);
        this.toggleCommentsSection = this.toggleCommentsSection.bind(this);
    }

    componentDidMount() {
        const props = this.props;
        if(props.post.s3ImgUri !== "") {
            if(props.imageRepo[props.post.s3ImgUri] === undefined) {
                props.fetchImage(props.post.s3ImgUri, props.authToken, "post");
            } else {
                this.setState({
                    localImgUrl: props.imageRepo[props.post.s3ImgUri]
                })
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.imageRepo[this.props.post.s3ImgUri] !== prevProps.imageRepo[prevProps.post.s3ImgUri]) {
            this.setState({
                localImgUrl: this.props.imageRepo[this.props.post.s3ImgUri]
            })
        }
        if(this.props.comments !== prevProps.comments) {
            this.setState({
                numOfLikes: this.props.post.numOfLikes,
                commentPageToken: this.props.post.commentPageToken,
                numOfComments: this.props.post.numOfComments
            })
        }
        if(this.props.owner !== prevProps.owner) {
            this.setState({
                numOfLikes: this.props.post.numOfLikes,
                numOfComments: this.props.post.numOfComments
            })
        }
        if(this.props.post !== prevProps.post) {
            this.updatePostState();
        }
        if(this.props.updatePostTrigger !== prevProps.updatePostTrigger) {
            this.updatePostState();
        }
    }

    updatePostState = () => {
        const props = this.props;

        let liked = false;
        if(!(props.post.liked == null)) {
            liked = props.post.liked
        }
        let howLongAgo = Date.now() - props.post.when;
        let whenPosted;
        if(howLongAgo < 180000) {
            whenPosted = 'Just now';
        } else if(howLongAgo < 3.6*10**6) {
            let mins = Math.floor(howLongAgo/60000);
            whenPosted = mins.toString()+' min ago';
        } else if(howLongAgo < 8.64*10**7) {
            let hrs = Math.floor(howLongAgo/(3.6*10**6));
            whenPosted = hrs.toString()+' hrs ago';
        } else if(howLongAgo < 1.728*10**8) {
            whenPosted = 'Yesterday';
        } else {
            whenPosted = new Date(props.post.when).toDateString();
        }

        let numOfLikes = 0;
        if(props.post.numOfLikes !== undefined) {
            numOfLikes = props.post.numOfLikes;
        }

        let numOfComments = 0;
        if(props.post.numOfComments !== undefined) {
            numOfComments = props.post.numOfComments;
        }

        let commentPageToken = "0";
        if(props.post.commentPageToken !== undefined) {
            commentPageToken = props.post.commentPageToken;
        }

        let localImgUrl = null;
        if(props.post.s3ImgUri !== "") {
            if(props.imageRepo[props.post.s3ImgUri] === undefined) {
                props.fetchImage(props.post.s3ImgUri, props.authToken, "post");
            } else {
                localImgUrl = props.imageRepo[props.post.s3ImgUri]
            }
        }

        this.setState({
            activeUserLiked: liked,
            whenPosted: whenPosted,
            numOfLikes: numOfLikes,
            numOfComments: numOfComments,
            commentPageToken: commentPageToken,
            showComments: this.commentFetching,
            localImgUrl: localImgUrl
        }, () => {
            this.commentFetching = false;
        })
    };
    toggleLike = () => {
        const props = this.props;
        const post = props.post;
        if(this.state.activeUserLiked) {
            this.setState({
                activeUserLiked: false,
                numOfLikes: this.state.numOfLikes-1
            });
            props.unlikePost(props.owner, post.postUuid, props.authToken, props.postKey);
        } else {
            this.setState({
                activeUserLiked: true,
                numOfLikes: this.state.numOfLikes+1
            });
            props.likePost(props.owner, post.postUuid, props.authToken, props.postKey);
        }
    };
    toggleCommentsSection = () => {
        if(this.state.numOfComments > 0 && this.state.commentPageToken === "0") {
            this.fetchComments();
        } else {
            this.setState({
                showComments: !this.state.showComments
            })
        }
    };
    fetchComments = () => {
        if(this.state.commentPageToken === "") {
            return;
        }
        this.commentFetching = true;
        this.props.fetchPostComments(this.props.authToken, this.props.owner, this.props.post.postUuid,
            this.props.postKey, this.state.commentPageToken);
    };

    render() {
        const props = this.props;
        const state = this.state;
        const classes = this.props.classes;

        const postAvatar = (
            <ProfilePic s3ImageUri={props.post.posterProfilePicUri} userFirstName={props.post.firstName} userUuid={props.post.userUuid}/>
        );

        let postTitle = (
            <div onClick={()=>{props.navigateTo(props.post.userUuid)}} className={classes.postTitle}>
                {props.post.firstName.charAt(0).toUpperCase()+props.post.firstName.substring(1)}
            </div>
        );
        if(props.post.owner !== props.post.userUuid) {
            postTitle = (
                <div>
                   <span onClick={()=>{props.navigateTo(props.post.userUuid)}} className={classes.postTitle}>
                       {props.post.firstName.charAt(0).toUpperCase()+props.post.firstName.substring(1)}
                   </span>
                    <span>
                        {" posted on "}
                    </span>
                    <span onClick={()=>{props.navigateTo(props.post.owner)}} className={classes.postTitle}>
                        {props.post.ownerFirstName.charAt(0).toUpperCase()+props.post.ownerFirstName.substring(1)+"'s"}
                    </span>
                    <span>
                        {" profile"}
                    </span>
                </div>

            );
        }

        const postSubheader = (
            <div className={classes.textSubheaderFont}>
                {state.whenPosted}
            </div>
        );
        // const postOptions = (
        //     <IconButton className={classes.postOptions} color="primary">
        //         <MoreVertIcon />
        //     </IconButton>
        // );
        const likeButton = (
            <React.Fragment>
                <IconButton onClick={this.toggleLike} className={classes.actionButton} color="primary">
                        {
                            state.activeUserLiked ?
                                (
                                    <Badge badgeContent={state.numOfLikes} color={"secondary"}>
                                        <Grow in={state.activeUserLiked}>
                                            <FavoriteIcon/>
                                        </Grow>
                                    </Badge>
                                ):
                                (
                                    <Badge badgeContent={state.numOfLikes} color={"secondary"}>
                                        <FavoriteBorderIcon/>
                                    </Badge>
                                )
                        }
                </IconButton>
            </React.Fragment>
        );
        const postBody = (
            <React.Fragment>
                <div className={classes.textBodyFont}>
                    {props.post.text}
                </div>
            </React.Fragment>
        );
        let imageBody = null;
        if(state.localImgUrl !== null) {
            imageBody = (
                <div>
                    <div style={{height: 4}}/>
                    <img alt="" src={state.localImgUrl}/>
                    <div style={{height: 4}}/>
                </div>
            )
        }

        const commentButton = (
            <React.Fragment>
                <IconButton onClick={this.toggleCommentsSection} className={classes.actionButton} color="primary">
                    <Badge badgeContent={state.numOfComments} color={"secondary"}>
                        <CommentsIcon/>
                    </Badge>
                </IconButton>
            </React.Fragment>
        );
        const commentSection = (
            <React.Fragment>
                <Paper data-simplebar className={classes.commentsContainer}>
                    <Grid container direction="column" justify="flex-start" alignItems="stretch">
                        <Grid item>
                            <CommentForm postUuid={props.post.postUuid} postKey={props.postKey} postOwnerUuid={props.owner}/>
                        </Grid>
                        {
                            props.comments !== undefined &&
                                    <React.Fragment>
                                        {props.comments.length > 0 &&
                                        <React.Fragment>
                                        {
                                            props.comments.map((comment, index) => (
                                                <div key={index}>
                                                    {
                                                        state.showComments &&
                                                        <Grid className={classes.commentSectionItem} key={index} item>
                                                            <CommentObject comment={comment} postOwner={props.owner} postUuid={props.post.postUuid}
                                                                           postKey={props.postKey} commentKey={index}
                                                            />
                                                        </Grid>
                                                    }
                                                </div>
                                            ))
                                        }
                                        </React.Fragment>
                                        }
                                        {
                                            this.state.numOfComments === props.comments.length ?
                                                (
                                                    <div style={{height: 7}}/>
                                                ):
                                                (
                                                    <React.Fragment>
                                                        <Grid item container direction="row" justify="center"
                                                              className={classes.moreCommentsButton} onClick={this.fetchComments}>
                                                            <CommentsIcon className={classes.commentsIcon}/>
                                                            {"Load More Comments"}
                                                        </Grid>
                                                    </React.Fragment>
                                                )
                                        }
                                    </React.Fragment>
                        }
                        {
                            props.comments === undefined && <div style={{height: 7}}/>
                        }
                    </Grid>
                </Paper>
            </React.Fragment>
        );

        return (
            <div className={classes.postContainer}>
                <div className={classes.innerContainer}>
                    <Card>
                        <CardHeader className={classes.postHeader} avatar={postAvatar}
                                    title={postTitle} subheader={postSubheader}/>
                        <CardContent className={classes.postBody}>
                            <div>
                                {postBody}
                            </div>
                        </CardContent>
                        {imageBody}
                        <CardActions className={classes.postFooter}>
                            <div className={classes.sideIconSpace}/>
                            {likeButton}
                            <div className={classes.middleIconSpace}/>
                            {commentButton}
                            <div className={classes.sideIconSpace}/>
                        </CardActions>
                    </Card>
                </div>
                <div className={classes.commentsSection}>
                    {commentSection}
                </div>
            </div>
        );
    }
}

PostObject.propTypes = {
    classes: PropTypes.any.isRequired,
    post: PropTypes.object.isRequired,
    activeUser: PropTypes.object.isRequired,
    authToken: PropTypes.string.isRequired,
    updatePostTrigger: PropTypes.bool.isRequired,
    postKey: PropTypes.number.isRequired,
    fetchPostComments: PropTypes.func.isRequired,
    likePost: PropTypes.func.isRequired,
    unlikePost: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired,
    owner: PropTypes.string.isRequired,
    comments: PropTypes.array,
    fetchImage: PropTypes.func.isRequired,
    imageRepo: PropTypes.object
};

export default compose(withStyles(styles), connect(mapStateToProps, {
    fetchPostComments, likePost, unlikePost, navigateTo, fetchImage
}))(PostObject);