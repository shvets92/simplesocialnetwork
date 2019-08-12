import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import PostObject from "../PostComponents/PostObject";

const styles = theme => ({
    container: {
        paddingTop: 8
    }
});

const mapStateToProps = state => ({
    notificationPostLookup: state.posts.notificationPostLookup,
    postRepo: state.posts
});

class NotificationPostPage extends Component {
    render() {
        const classes = this.props.classes;
        const props = this.props;

        let postObject = props.postRepo[props.notificationPostLookup.userUuid]
                            .postObjects[props.notificationPostLookup.postKey];

        return (
            <div className={classes.container}>
                <Grid container direction="row" justify="center" alignContent="flex-start">
                    <PostObject post={postObject} comments={postObject.comments}
                                owner={postObject.owner} postKey={props.notificationPostLookup.postKey}
                    />
                </Grid>
            </div>
        );
    }
}

NotificationPostPage.propTypes = {
    classes: PropTypes.any.isRequired,
    notificationPostLookup: PropTypes.object.isRequired,
    postRepo: PropTypes.object.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, null))(NotificationPostPage);