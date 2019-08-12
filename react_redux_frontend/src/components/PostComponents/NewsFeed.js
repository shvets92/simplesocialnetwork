import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchNewsFeed} from "../../actions/postActions";
import PropTypes from 'prop-types';

import PostForm from './PostForm';
import PostObject from './PostObject';

import Grid from "@material-ui/core/Grid";

const mapStateToProps = state => ({
    posts: state.posts.items,
    newPost: state.posts.item,
    activeUser: state.accountAccess.activeUser,
    authToken: state.accountAccess.authToken
});

class NewsFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }

    }

    componentWillMount() {
        if(this.props.posts.length < 1) {
            this.props.fetchNewsFeed();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if(this.props.newPost !== prevProps.newPost) {
        //     this.props.posts.unshift(this.props.newPost);
        //     this.forceUpdate();
        // }
    }

    render() {
        const posts = (//should have a friends and public platform option for posts
            <React.Fragment>
                {this.props.posts.map(post => (
                    <Grid key={post.id} item>
                        <PostObject post={{
                            firstName: post.firstName,
                            text: post.text
                        }}/>
                    </Grid>
                ))}
            </React.Fragment>
        );

        return (
            <div>
                <Grid container direction="column" justify="center" alignItems="center">
                    <h1>Public Post Area</h1>
                    <PostForm authToken={this.props.authToken} targetUser={this.props.activeUser.uuid}/>
                    {posts}
                </Grid>
            </div>
        );
    }
}

NewsFeed.propTypes = {
    fetchNewsFeed: PropTypes.func.isRequired,
    posts: PropTypes.array.isRequired,
    activeUser: PropTypes.object.isRequired,
    authToken: PropTypes.string.isRequired,
    newPost: PropTypes.object
};

export default connect(mapStateToProps, {fetchNewsFeed})(NewsFeed);