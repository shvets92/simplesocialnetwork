import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import {navigateTo} from "../../actions/navigationActions";
import {likeComment, unlikeComment} from "../../actions/postActions";

import Grid from '@material-ui/core/Grid';
import IconButton from "@material-ui/core/IconButton";
import Grow from "@material-ui/core/Grow";
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ProfilePic from "../ImageComponents/ProfilePic";
import Badge from "@material-ui/core/es/Badge/Badge";

const styles = theme => ({
    avatar: {
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.main,
        maxWidth: 32,
        maxHeight: 32
    },
    commentTitle: {
        cursor: "pointer",
        paddingRight: 4,
        fontFamily: 'PTSansCaptionBold',
        fontSize: 14,
        color: theme.palette.primary.main
    },
    text: {
        fontFamily: 'PTSansRegular',
        fontSize: 14
    },
    textInnerContainer: {
        borderRadius: 25,
        backgroundColor: theme.palette.primary["300"],
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 4,
        paddingBottom: 6,
        minHeight: 32
    },
    textContainer: {
        paddingLeft: 4,
        paddingRight: 4
    },
    likeButton: {
        padding: 4,
        background: "transparent"
    }
});

const mapStateToProps = state => ({
    authToken: state.accountAccess.authToken
});

class CommentObject extends Component {
    constructor(props) {
        super(props);

        let liked = false;
        if(!(props.comment.liked === undefined)) {
            if(!(props.comment.liked == null)) {
                liked = props.comment.liked;
            }
        }

        let howLongAgo = Date.now() - props.comment.when;
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
            whenPosted = new Date(props.comment.when).toString();
        }

        this.state = {
            activeUserLiked: liked,
            whenPosted: whenPosted,
            numOfLikes: props.comment.numOfLikes
        };

        this.updateCommentState = this.updateCommentState.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.comment !== prevProps.comment) {
            this.updateCommentState();
        }
    }

    updateCommentState = () => {
        const props = this.props;

        let liked = false;
        if(!(props.comment.liked === undefined)) {
            if(!(props.comment.liked == null)) {
                liked = props.comment.liked;
            }
        }

        let howLongAgo = Date.now() - props.comment.when;
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
            whenPosted = new Date(props.comment.when).toString();
        }

        this.setState({
            activeUserLiked: liked,
            whenPosted: whenPosted,
            numOfLikes: props.comment.numOfLikes
        });
    };

    toggleLike() {
        const state = this.state;
        const props = this.props;
        if(state.activeUserLiked) {
            this.setState({
                activeUserLiked: false,
                numOfLikes: state.numOfLikes-1
            });
            props.unlikeComment(props.postOwner, props.postUuid, props.comment.commentUuid, props.authToken, props.postKey, props.commentKey);
        } else {
            this.setState({
                activeUserLiked: true,
                numOfLikes: state.numOfLikes+1
            });
            props.likeComment(props.postOwner, props.postUuid, props.comment.commentUuid, props.authToken, props.postKey, props.commentKey);
        }
    }

    render() {
        const props = this.props;
        const classes = props.classes;
        const comment = props.comment;
        const state = this.state;

        const renderAvatar = (
                <ProfilePic s3ImageUri={comment.posterProfilePicUri} userFirstName={comment.firstName}
                            userUuid={comment.userUuid} styleOverride={classes.avatar}
                />
        );

        const likeButton = (
            <React.Fragment>
                <IconButton onClick={this.toggleLike} className={classes.likeButton} color="primary">
                    {
                        this.state.activeUserLiked ? (
                            <Badge badgeContent={state.numOfLikes} color="secondary">
                                <Grow in={this.state.activeUserLiked}>
                                    <FavoriteIcon/>
                                </Grow>
                            </Badge>
                        ):(
                            <Badge badgeContent={state.numOfLikes} color="secondary">
                                <FavoriteBorderIcon/>
                            </Badge>
                        )
                    }
                </IconButton>
            </React.Fragment>
        );

        const renderTextBubble = (
            <div className={classes.textInnerContainer}>
                <Grid container direction="column" alignContent="flex-start" justify="flex-start">
                    <span>
                        <span onClick={()=>props.navigateTo(comment.userUuid)} className={classes.commentTitle}>
                            {comment.firstName.charAt(0).toUpperCase()+comment.firstName.substring(1)}
                        </span>
                        <span className={classes.text}>
                            {comment.text}
                        </span>
                    </span>
                </Grid>
            </div>
        );

        return (
            <div>
                <Grid container direction="row" justify="flex-start" alignContent="flex-start">
                    <Grid item>
                        {renderAvatar}
                    </Grid>
                    <Grid item xs className={classes.textContainer}>
                        {renderTextBubble}
                    </Grid>
                    <Grid item>
                        {likeButton}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

CommentObject.propTypes = {
    classes: PropTypes.any.isRequired,
    comment: PropTypes.object.isRequired,
    authToken: PropTypes.string.isRequired,
    navigateTo: PropTypes.func.isRequired,
    likeComment: PropTypes.func.isRequired,
    unlikeComment: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {navigateTo, likeComment, unlikeComment}))(CommentObject);