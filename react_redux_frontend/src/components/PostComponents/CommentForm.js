import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';

import {createComment} from "../../actions/postActions";

import Grid from '@material-ui/core/Grid';
import InputBase from "@material-ui/core/es/InputBase";
import ButtonBase from "@material-ui/core/es/ButtonBase/ButtonBase";
import SendIcon from "@material-ui/icons/SendRounded";
import yellow from "@material-ui/core/colors/yellow";
import deepPurple from "@material-ui/core/colors/deepPurple";
import ProfilePic from "../ImageComponents/ProfilePic";

const styles = theme => ({
    avatar: {
        color: yellow[500],
        backgroundColor: deepPurple[500],
        maxWidth: 32,
        maxHeight: 32
    },
    textField: {
        fontFamily: 'PTSansCaptionRegular',
        fontSize: 12,
        padding: 8
    },
    textInnerContainer: {
        borderRadius: 25,
        backgroundColor: deepPurple[300],
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 1,
        paddingBottom: 1
    },
    textContainer: {
        paddingLeft: 4,
        paddingRight: 4
    },
    sendIcon: {
        color: deepPurple[500],
        minHeight: 26,
        minWidth: 26,
        marginLeft: 4
    },
    sendButton: {
        height: 32,
        width: 48,
        padding: 0,
        borderRadius: 25,
    }
});

const mapStateToProps = state => ({
    activeUser: state.accountAccess.activeUser,
    authToken: state.accountAccess.authToken
});

class CommentForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: ''
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }
    onSubmit(e) {
        e.preventDefault();
        if(this.state.text.length < 1) {
            return;
        }
        this.props.createComment(this.state.text, this.props.authToken, this.props.postOwnerUuid, this.props.postUuid, this.props.postKey);
        this.setState({
            text: ''
        })
    }

    render() {
        const props = this.props;
        const classes = props.classes;

        const renderAvatar = (
            <ProfilePic s3ImageUri={props.activeUser.profilePic} userUuid={props.activeUser.uuid}
                        userFirstName={props.activeUser.firstName} styleOverride={classes.avatar}
            />
        );

        const renderTextField = (
            <div className={classes.textInnerContainer} ref={this.setTextFieldRef}>
                <InputBase className={classes.textField} placeholder="Thoughts?" multiline={true} fullWidth={true}
                           autoComplete="off" rowsMax={4} name="text" onChange={this.onChange} value={this.state.text}
                />
            </div>
        );

        return (
            <div>
                <Grid container direction="row" justify="flex-start">
                    <Grid item>
                        {renderAvatar}
                    </Grid>
                    <Grid item xs className={classes.textContainer}>
                        {renderTextField}
                    </Grid>
                    <Grid item>
                        <ButtonBase onClick={this.onSubmit} className={classes.sendButton}>
                            <SendIcon className={classes.sendIcon}/>
                        </ButtonBase>
                    </Grid>
                </Grid>
            </div>
        );
    }
}


CommentForm.propTypes = {
    classes: PropTypes.any.isRequired,
    createComment: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired,
    authToken: PropTypes.string.isRequired,
    postUuid: PropTypes.string.isRequired,
    postOwnerUuid: PropTypes.string.isRequired,
    postKey: PropTypes.number.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {createComment}))(CommentForm);