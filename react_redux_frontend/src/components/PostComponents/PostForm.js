import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import {createPost} from "../../actions/postActions";

import {withStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardActionArea from "@material-ui/core/es/CardActionArea/CardActionArea";
import Switch from "@material-ui/core/es/Switch/Switch";
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import InputBase from "@material-ui/core/es/InputBase/InputBase";
import AddPhotoIcon from "@material-ui/icons/AddPhotoAlternate";
import grey from "@material-ui/core/es/colors/grey";
import yellow from "@material-ui/core/colors/yellow";
import deepPurple from "@material-ui/core/colors/deepPurple";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import Button from "@material-ui/core/es/Button/Button";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import ProfilePic from "../ImageComponents/ProfilePic";

const styles = theme => ({
    avatar: {
        color: yellow[500],
        backgroundColor: deepPurple[500]
    },
    avatarContainerDefault: {
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 0,
        paddingBottom: 16,
        marginRight: -8
    },
    avatarContainerEditing: {
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 8,
        paddingBottom: 0
    },
    formContainer: {
        width: 500,
        paddingTop: 4,
        paddingBottom: 8
    },
    formCard: {
        padding: 16
    },
    formHeader: {
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 4
    },
    headerTitle: {
        cursor: "pointer",
        paddingTop: 0,
        marginBottom: -10,
        fontFamily: 'PTSansCaptionBold',
        fontSize: 18,
        color: deepPurple[500]
    },
    textField: {
        fontFamily: 'PTSansCaptionRegular',
        fontSize: 16
    },
    textFieldContainer: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 4,
        paddingTop: 4
    },
    addPhotoIcon: {
        paddingBottom: 16,
        paddingRight: 16,
        paddingLeft: 0,
        paddingTop: 16,
        maxWidth: 40
    },
    addPhotoSmallButton: {
        padding: 8
    },
    addPhotoText: {
        fontFamily: 'PTSansCaptionBold',
        fontSize: 14,
        color: deepPurple[500]
    },
    addPhotoArea: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 4,
        paddingBottom: 4
    },
    submitButton: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
        paddingTop: 8,
        fontFamily: 'PTSansCaptionBold',
        fontSize: 16,
        backgroundColor: deepPurple[500],
        color: yellow[500]
    },
    switchLabelText: {
        fontFamily: 'PTSansBold',
        fontSize: 14,
        color: deepPurple[500]
    },
    switchLabelTextDisabled: {
        fontFamily: 'PTSansBold',
        fontSize: 14,
        color: grey[500]
    },
    privacyLabel: {
        fontFamily: 'PTSansCaptionRegular',
        fontSize: 14,
        color: deepPurple[500]
    }
});

const mapStateToProps = state => ({
    activeUser: state.accountAccess.activeUser,
    authToken: state.accountAccess.authToken
});

class PostForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            textFieldRef: null,
            formRef: null,
            editMode: false,
            showFriends: true,
            showEveryone: false,
            disableShareToEveryone: false,
            imageFile: null,
            imagePreviewUrl: '',
            openEditImageDialog: false
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.switchChange = this.switchChange.bind(this);
        this.startClickListening = this.startClickListening.bind(this);
        this.stopClickListening = this.stopClickListening.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.enableEditing = this.enableEditing.bind(this);
        this.disableEditing = this.disableEditing.bind(this);
        this.openImageDialog = this.openImageDialog.bind(this);
        this.closeImageDialog = this.closeImageDialog.bind(this);
        this.removeImage = this.removeImage.bind(this);
    }

    componentWillMount() {
        this.startClickListening();
    }
    componentWillUnmount() {
        this.stopClickListening();
    }

    onChange(e) {
        if(e.target.name === 'postImage') {
            if (e.target.files.length > 0) {
                this.setState({
                    imageFile: e.target.files[0],
                    imagePreviewUrl: URL.createObjectURL(e.target.files[0])
                });
            }
        } else {
            this.setState({[e.target.name]: e.target.value});
        }
    }
    onSubmit(e) {
        e.preventDefault();
        const post = {
            text: this.state.text,
            showFriends: this.state.showFriends,
            showEveryone: this.state.showEveryone
        };

        this.props.createPost(post, this.state.imageFile, this.props.authToken, this.props.targetUser);

        this.setState({
            text: '',
            imageFile: null,
            imagePreviewUrl: '',
            editMode: false
        })
    }
    switchChange(e) {
        this.setState({
            [e.target.name]: e.target.checked
        }, () => {
            if (!this.state.showFriends) {
                this.setState({
                    showEveryone: false,
                    disableShareToEveryone: true
                })
            } else {
                this.setState({
                    disableShareToEveryone: false
                })
            }
        })
    }

    setTextFieldRef = node => {
        this.setState({
            textFieldRef: node
        })
    };
    setFormRef = node => {
        this.setState({
            formRef: node
        })
    };

    startClickListening = () => {
        document.addEventListener('mouseup', this.handleClick, false);
    };
    stopClickListening = () => {
        document.removeEventListener('mouseup', this.handleClick, false);
    };
    handleClick = (e) => {
        if (this.state.textFieldRef == null || this.state.openEditImageDialog) {
            return;
        }

        if (this.state.textFieldRef.contains(e.target)) {
            this.enableEditing();
        } else if (!this.state.formRef.contains(e.target)) {
            this.disableEditing();
        }
    };
    enableEditing = () => {
        this.setState({
            editMode: true
        })
    };
    disableEditing = () => {
        this.setState({
            editMode: false
        })
    };

    openImageDialog = () => {
        this.setState({
            openEditImageDialog: true
        })
    };
    closeImageDialog = () => {
        this.setState({
            openEditImageDialog: false
        })
    };
    removeImage = () => {
        this.setState({
            imageFile: null,
            imagePreviewUrl: '',
            openEditImageDialog: false
        })
    };

    render() {
        const props = this.props;
        const classes = props.classes;
        const state = this.state;

        const renderAvatar = (
                <ProfilePic s3ImageUri={props.activeUser.profilePic} userUuid={props.activeUser.uuid}
                            userFirstName={props.activeUser.firstName}
                />
        );

        const renderTextField = (
            <div ref={this.setTextFieldRef}>
                <InputBase className={classes.textField} placeholder="What's up?" multiline={true} fullWidth={true}
                           autoComplete="off" rowsMax={6} name="text" onChange={this.onChange} value={this.state.text}
                />
            </div>
        );

        const renderAddImage = (
            <React.Fragment>
                <input style={{display: 'none'}} type="file" name="postImage" accept=".jpg, .jpeg, .png"
                       onChange={this.onChange} ref={fileInput => this.fileInput = fileInput}
                />
                <IconButton onClick={()=>this.fileInput.click()} className={classes.addPhotoSmallButton} color="primary">
                    <AddPhotoIcon/>
                </IconButton>
            </React.Fragment>
        );

        let imageArea = null;
        if(state.editMode) {
            if(state.imagePreviewUrl === '') {
                imageArea = (
                    <div>
                        <input style={{display: 'none'}} type="file" name="postImage" accept=".jpg, .jpeg, .png"
                               onChange={this.onChange} ref={fileInput => this.fileInput = fileInput}
                        />
                        <CardActionArea onClick={()=>this.fileInput.click()} className={classes.addPhotoArea}>
                            <Grid container direction="row" justify="center" alignItems="center">
                                <Grid item>
                                    <AddPhotoIcon color="primary"/>
                                </Grid>
                                <Grid item>
                                    <span className={classes.addPhotoText}>
                                        Add Image
                                    </span>
                                </Grid>
                            </Grid>
                        </CardActionArea>
                    </div>
                );
            } else {
                imageArea = (
                    <Button style={{padding: 0}} onClick={this.openImageDialog}>
                        <img alt="" src={state.imagePreviewUrl}/>
                    </Button>
                );
            }

        }

        let renderPrivacySwitches = (<div/>);
        if(props.targetUser === props.activeUser.uuid) {
            renderPrivacySwitches = (
                <React.Fragment>
                    <Grid style={{maxWidth: 250, paddingTop: 8}} spacing={0}
                          item container direction="column" justify="center" alignItems="center">
                        <Grid item>
                            <span className={classes.privacyLabel}>
                                Who should see this?
                            </span>
                        </Grid>
                        <Grid item container direction="row" justify="flex-end" alignItems="center">
                            <Grid item>
                                <span className={classes.switchLabelText}>
                                    Friends
                                </span>
                                <Switch checked={this.state.showFriends} onChange={this.switchChange} name="showFriends"
                                        color="primary" style={{maxHeight: 20}}
                                />
                            </Grid>
                            <Grid item>
                                {
                                    !this.state.disableShareToEveryone ?
                                        (
                                            <span className={classes.switchLabelText}>
                                            Everyone
                                        </span>
                                        ) : (
                                            <span className={classes.switchLabelTextDisabled}>
                                            Everyone
                                        </span>
                                        )
                                }
                                <Switch onChange={this.switchChange} name="showEveryone"
                                        checked={this.state.showEveryone} color="primary"
                                        disabled={this.state.disableShareToEveryone} style={{maxHeight: 20}}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </React.Fragment>
            );
        }

        return (
            <div className={classes.formContainer} ref={this.setFormRef}>
                <Card>
                    {
                        this.state.editMode &&
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <Grid item className={classes.avatarContainerEditing}>{renderAvatar}</Grid>
                            <Grid item className={classes.headerTitle}>New Post</Grid>
                            <Grid xs item/>
                            {renderPrivacySwitches}
                        </Grid>
                    }
                    <Grid container direction="row" justify="space-between" alignItems="center">
                        {
                            !this.state.editMode &&
                            <Grid item className={classes.avatarContainerDefault}>
                                {renderAvatar}
                            </Grid>
                        }
                        <Grid item xs className={classes.textFieldContainer}>
                            {renderTextField}
                        </Grid>
                        {
                            !this.state.editMode &&
                            <Grid item container className={classes.addPhotoIcon}
                                  direction="row" justify="flex-end" alignItems="center"
                            >
                                <Grid item>{renderAddImage}</Grid>
                            </Grid>
                        }
                    </Grid>
                    {imageArea}
                    {
                        this.state.editMode &&
                        <CardActionArea onClick={this.onSubmit}>
                            <Grid item container className={classes.submitButton} direction="row"
                                  justify="center" alignItems="center"
                            >
                                <Grid item>
                                    Submit New Post
                                </Grid>
                            </Grid>
                        </CardActionArea>
                    }
                </Card>
                <Dialog open={state.openEditImageDialog} onClose={this.closeImageDialog}>
                    <DialogTitle>
                        Remove Image?
                    </DialogTitle>
                    <Button onClick={this.removeImage}>Yes</Button>
                    <Button onClick={this.closeImageDialog} color="primary">No</Button>
                </Dialog>
            </div>
        );
    }
}

PostForm.propTypes = {
    classes: PropTypes.any.isRequired,
    createPost: PropTypes.func.isRequired,
    targetUser: PropTypes.string.isRequired,
    authToken: PropTypes.string.isRequired,
    activeUser: PropTypes.object.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {createPost}))(PostForm);