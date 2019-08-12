import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';

import {login} from "../../actions/accountAccessActions";
import TextField from "@material-ui/core/es/TextField";
import Button from "@material-ui/core/es/Button";
import compose from "recompose/compose";
import {withStyles} from "@material-ui/core";
import Paper from "@material-ui/core/es/Paper";
import Grid from "@material-ui/core/es/Grid";

const styles = theme => ({
    container: {
        padding: 64
    },
    title: {
        fontFamily: 'PTSansCaptionBold',
        fontSize: 32,
        color: theme.palette.primary.main
    },
    subTitle: {
        fontFamily: 'PTSansCaptionBold',
        fontSize: 24,
        color: theme.palette.primary["300"]
    },
    textField: {
        fontFamily: 'PTSansCaption',
        fontSize: 16,
    },
    errorText: {
        fontFamily: 'PTSansCaption',
        fontSize: 16,
        color: theme.palette.error.main
    },
    loginButton: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.default,
        marginTop: 8
    }
});

const mapStateToProps = state => ({
    isLoggedIn: state.accountAccess.isLoggedIn,
    failureReason: state.accountAccess.failureReason,
    authenticationHeaders: state.accountAccess.authenticationHeaders,
    accountCreated: state.accountAccess.accountCreated
});

class LoginComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            nonExistingEmailError: false,
            invalidPasswordError: false,
            updateTrigger: false
        };

        this.input = null;

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.input = document.getElementById("passwordInput");
        this.input.addEventListener("keyup", (e)=>{
            if(e.code === "Enter") {
                this.onSubmit();
            }
        });
    }
    componentWillUnmount() {
        this.input.removeEventListener("keyup", (e)=>{
            if(e.code === "Enter") {
                this.onSubmit();
            }
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if((prevProps.failureReason !== this.props.failureReason) || (prevProps.isLoggedIn !== this.props.isLoggedIn)) {
            if(!this.props.loginSuccessful) {
                if(this.props.failureReason === "Email not found") {
                    this.setState({
                        nonExistingEmailError: true,
                        invalidPasswordError: false
                    });
                } else if(this.props.failureReason === "Invalid Password") {
                    this.setState({
                        nonExistingEmailError: false,
                        invalidPasswordError: true
                    });
                }
            }
        }
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = () => {
        let userData = {
            "email": this.state.email,
            "password": this.state.password
        };
        this.props.login(userData);
    };

    render() {
        const state = this.state;
        const classes = this.props.classes;

        return (
            <Grid container alignContent="center" direction="column">
                {
                    this.props.accountCreated &&
                        <div>
                            <div className={classes.title}>
                                Account Created!
                            </div>
                            <div className={classes.subTitle}>
                                Try logging in
                            </div>
                        </div>
                }
                <Paper className={classes.container}>
                    <div className={classes.title}>Login Page</div>
                    <div>
                        <MessageBox classes={classes} invalidPasswordError={state.invalidPasswordError}
                                    nonExistingEmailError={state.nonExistingEmailError}
                        />
                        <div>
                            <TextField name="email" label="Email" value={state.email} onChange={this.onChange}
                                       className={classes.textField} margin="dense" variant="outlined"
                                       error={state.nonExistingEmailError} InputLabelProps={{ shrink: true }}
                                       autoFocus={true}
                                       InputProps={{
                                           classes: {
                                               input: classes.textField
                                           }
                                       }}
                            />
                        </div>
                        <div>
                            <TextField name="password" label="Password" value={state.password} onChange={this.onChange}
                                       margin="dense" variant="outlined" required={true} type="password"
                                       error={state.invalidPasswordError} id={"passwordInput"} InputLabelProps={{ shrink: true }}
                                       InputProps={{
                                           classes: {
                                               input: classes.textField
                                           }
                                       }}
                            />
                        </div>
                        <Button className={classes.loginButton} onClick={this.onSubmit}>Login</Button>
                    </div>
                </Paper>
            </Grid>
        );
    }
}

class MessageBox extends Component {
    render() {
        if(this.props.invalidPasswordError) {
            return (
                <span className={this.props.classes.errorText}>The password you entered was incorrect</span>
            );
        } else if(this.props.nonExistingEmailError){
            return (
                <span className={this.props.classes.errorText}>An account with this email doesn't exist</span>
            );
        }
        return (
            <span className={this.props.classes.textField}>Enter login information here</span>
        );
    }
}

LoginComponent.propTypes = {
    classes: PropTypes.any.isRequired,
    login: PropTypes.func.isRequired,
    loginSuccessful: PropTypes.bool,
    failureReason: PropTypes.string,
    authenticationHeaders: PropTypes.object,
    accountCreated: PropTypes.bool.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {login}))(LoginComponent);


