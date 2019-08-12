import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import {fetchNewsFeed} from "../../actions/postActions";
import PostObject from "../PostComponents/PostObject";
import Grid from "@material-ui/core/Grid";
import PostForm from "../PostComponents/PostForm";

const styles = theme => ({
    container: {
        paddingTop: 8
    },
    postsColumn: {
        width: 500
    }
});

const mapStateToProps = state => ({
    newsFeedPostLookup: state.posts.newsFeedPostLookup,
    newsFeedToken: state.posts.newsFeedToken,
    postRepo: state.posts,
    updatePostTrigger: state.posts.updatePostTrigger,
    authToken: state.accountAccess.authToken,
    activeUserUuid: state.accountAccess.activeUser.uuid
});

class Home extends Component {
    constructor(props) {
        super(props);

        this.shouldFetch = false;

        this.startScrollListening = this.startScrollListening.bind(this);
        this.stopScrollListening = this.stopScrollListening.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        if(this.props.newsFeedToken === "0"){
            this.props.fetchNewsFeed(this.props.activeUserUuid, this.props.authToken, this.props.newsFeedToken);
        }
        this.startScrollListening();
    }
    componentWillUnmount() {
        this.stopScrollListening();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.newsFeedToken !== prevProps.newsFeedToken) {
            this.shouldFetch = true;
        }
    }

    startScrollListening = () => {
        window.addEventListener('scroll', this.handleScroll, false)
    };
    stopScrollListening = () => {
        window.removeEventListener('scroll', this.handleScroll, false)
    };
    handleScroll = () => {
        if ((window.innerHeight+window.pageYOffset+400) >= document.body.offsetHeight) {
            if(this.shouldFetch) {
                this.props.fetchNewsFeed(this.props.activeUserUuid, this.props.authToken, this.props.newsFeedToken);
                this.shouldFetch = false;
            }
        }
    };

    render() {
        const classes = this.props.classes;
        const props = this.props;

        let postObjects = [];
        props.newsFeedPostLookup.forEach((lookupData) => {
            let feedPost = props.postRepo[lookupData.userUuid].postObjects[lookupData.postKey];
            feedPost.postKey = lookupData.postKey;
            postObjects.push(feedPost);
        });

        const posts = (
            <React.Fragment>
                {postObjects.map((feedPost, index) => (
                    <Grid key={index} item>
                        <PostObject post={feedPost} comments={feedPost.comments} postKey={feedPost.postKey}
                                    owner={feedPost.userUuid}
                        />
                    </Grid>
                ))}
                {props.newsFeedToken === "" &&
                <div style={{minHeight: 350}}/>
                }
            </React.Fragment>
        );

        return (
            <div className={classes.container}>
                <Grid container direction="row" justify="center" alignItems="flex-start">
                    <Grid item container spacing={8} className={classes.postsColumn}
                          direction="column" justify="flex-start" alignItems="center"
                    >
                        <PostForm targetUser={props.activeUserUuid}/>
                        {posts}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.any.isRequired,
    newsFeedPostLookup: PropTypes.array.isRequired,
    newsFeedToken: PropTypes.string.isRequired,
    postRepo: PropTypes.object.isRequired,
    updatePostTrigger: PropTypes.bool.isRequired,
    authToken: PropTypes.string.isRequired,
    activeUserUuid: PropTypes.string.isRequired,
    fetchNewsFeed: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {fetchNewsFeed}))(Home);