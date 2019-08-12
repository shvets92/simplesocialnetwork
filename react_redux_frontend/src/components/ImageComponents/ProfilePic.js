import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { requestImageFetch } from "../../actions/imageActions";
import { navigateTo } from "../../actions/navigationActions";
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import Avatar from "@material-ui/core/Avatar";

const styles = theme => ({
    avatar: {
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.main
    },
    avatarButton: {
        padding: 0
    }
});

const mapStateToProps = state => ({
    imageRepo: state.images,
    authToken: state.accountAccess.authToken
});

class ProfilePic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            localImgUrl: ""
        };

        this.displayAvatar = null;
    }

    componentDidMount() {
        const props = this.props;
        if(props.s3ImageUri !== undefined) {
            if(props.s3ImageUri !== "") {
                if(props.imageRepo[props.s3ImageUri] === undefined) {
                    props.requestImageFetch(props.s3ImageUri, "post");
                } else {
                    this.setState({
                        localImgUrl: props.imageRepo[props.s3ImageUri]
                    })
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const props = this.props;
            if(props.imageRepo[props.s3ImageUri] !== undefined) {
                if(props.imageRepo[props.s3ImageUri] !== prevProps.imageRepo[prevProps.s3ImageUri]) {
                    this.setState({
                        localImgUrl: props.imageRepo[props.s3ImageUri]
                    })
                }
            } else {
                if(props.s3ImageUri === "" && props.s3ImageUri !== prevProps.s3ImageUri) {
                    this.setState({
                        localImgUrl: ""
                    })
                }
            }
    }

    render() {
        const classes = this.props.classes;
        const state = this.state;
        const props = this.props;

        let buttonStyle = classes.avatar;
        if(props.styleOverride !== undefined) {
            buttonStyle = props.styleOverride
        }

        if(state.localImgUrl === "") {
            if(props.noPicOverrideMessage !== undefined) {
                this.displayAvatar = (
                    <IconButton className={classes.avatarButton}>
                        <Avatar className={buttonStyle}>
                            {props.noPicOverrideMessage}
                        </Avatar>
                    </IconButton>
                );
            } else {
                this.displayAvatar = (
                    <IconButton className={classes.avatarButton}>
                        <Avatar className={buttonStyle}>
                            {props.userFirstName.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                );
            }
        } else {
            this.displayAvatar = (
                <IconButton className={classes.avatarButton}>
                    <Avatar src={state.localImgUrl} className={buttonStyle}/>
                </IconButton>
            );
        }
        if(props.noButton !== undefined) {
            if(props.noButton) {
                if(state.localImgUrl === "") {
                    this.displayAvatar = (
                        <Avatar className={buttonStyle}>
                            {props.userFirstName.charAt(0).toUpperCase()}
                        </Avatar>
                    );
                } else {
                    this.displayAvatar = (
                        <Avatar src={state.localImgUrl} className={buttonStyle}/>
                    );
                }
            }
        }


        if(props.clickable !== undefined) {
            if(!props.clickable) {
                return (
                    <div>
                        {this.displayAvatar}
                    </div>
                );
            }
        }
        if(props.userUuid === undefined) {
            return (
                <div>
                    {this.displayAvatar}
                </div>
            );
        }
        return (
            <div onClick={()=>props.navigateTo(props.userUuid)}>
                {this.displayAvatar}
            </div>
        );
    }
}

ProfilePic.propTypes = {
    classes: PropTypes.any.isRequired,
    requestImageFetch: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired,
    userUuid: PropTypes.string,
    userFirstName: PropTypes.string.isRequired,
    s3ImageUri: PropTypes.string.isRequired,
    styleOverride: PropTypes.any,
    clickable: PropTypes.bool,
    authToken: PropTypes.string.isRequired,
    noButton: PropTypes.bool,
    noPicOverrideMessage: PropTypes.string
};

export default compose(withStyles(styles), connect(mapStateToProps, {requestImageFetch, navigateTo}))(ProfilePic);