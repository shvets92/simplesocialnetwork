import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';

import {createAccount} from "../../actions/accountAccessActions";
import compose from "recompose/compose";
import {withStyles} from "@material-ui/core";
import Button from "@material-ui/core/es/Button";
import TextField from "@material-ui/core/es/TextField";
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
    textFieldContainer: {
        paddingTop: 8
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
    submitButton: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.default,
        marginTop: 12
    }
});

class AccountCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            password2: '',
            passLengthError: false,
            passMatchError: false,
            validEmailError: false,
            existingEmailError: false,
            firstNameLengthError: false,
            lastNameLengthError: false
        };
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.validateEmailSyntax = this.validateEmailSyntax.bind(this);
        this.checkExistingAccount = this.checkExistingAccount.bind(this);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    onSubmit(e) {
        e.preventDefault();
        this.checkExistingAccount(this.state.email).then(response => {
            this.setState({
                passLengthError: this.state.password.length < 8,
                passMatchError: this.state.password !== this.state.password2,
                validEmailError: !this.validateEmailSyntax(this.state.email),
                existingEmailError: response === "true",
                firstNameLengthError: this.state.firstName.length < 1,
                lastNameLengthError: this.state.lastName.length < 1
            }, () => {
                if(!(this.state.validEmailError || this.state.passLengthError
                    || this.state.passMatchError || this.state.existingEmailError)) {
                    let userData = {
                            "firstName": this.state.firstName,
                            "lastName": this.state.lastName,
                            "password": this.state.password,
                            "email": this.state.email
                        };
                    this.props.createAccount(userData);
                }
            });
        });
    }

    validateEmailSyntax(email) {
        let re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase()) && email.length < 200;
    }

    checkExistingAccount(email) {
        //check if email exists in database, returns promise with result
        let headers = new Headers();
        headers.append('Content-Type', 'text/plain');
        return fetch('/checkexistingaccount', {
            method: 'POST',
            headers: headers,
            body: email
        }).then(response => {
            return response.text()
        });
    }

    render() {
        const state = this.state;
        const props = this.props;
        const classes = props.classes;

        return (
            <Grid container alignContent="center" direction="column">
                <Paper className={classes.container}>
                    <div className={classes.title}>Create Account</div>
                    <div>
                        <div>
                            <EmailInput existingEmailError={state.existingEmailError}
                                        validEmailError={state.validEmailError} onChange={this.onChange}
                                        email={state.email} classes={classes}
                            />
                        </div>
                        <div className={classes.textFieldContainer}>
                            <NameInput label="First Name" nameLengthError={state.firstNameLengthError}
                                       onChange={this.onChange} nameType="firstName" nameValue={state.firstName}
                                       classes={classes}
                            />
                        </div>
                        <div className={classes.textFieldContainer}>
                            <NameInput label="Last Name" nameLengthError={state.lastNameLengthError}
                                       onChange={this.onChange} nameType="lastName" nameValue={state.lastName}
                                       classes={classes}
                            />
                        </div>
                        <div className={classes.textFieldContainer}>
                            <PasswordInput passLengthError={state.passLengthError} onChange={this.onChange}
                                           password={state.password} classes={classes}
                            />
                        </div>
                        <div className={classes.textFieldContainer}>
                            <PasswordConfirmInput passMatchError={state.passMatchError} onChange={this.onChange}
                                                  password={state.password2} classes={classes}
                            />
                        </div>
                        <Button className={classes.submitButton} onClick={this.onSubmit}>Submit</Button>
                    </div>
                </Paper>
            </Grid>
        );
    }
}

class EmailInput extends Component {
    render() {
        const props = this.props;
        const classes = props.classes;

        if(props.validEmailError) {
            return (
                <div>
                  <TextField name="email" label="Email" onChange={props.onChange} value={props.email} error={true}
                               required={true} variant="outlined" helperText="This must be a valid email"
                               InputProps={{
                                   classes: {
                                       input: classes.textField
                                   }
                               }}
                    />
                </div>
            );
        }else if(props.existingEmailError) {
            return (
                <div>
                    <TextField name="email" label="Email" onChange={props.onChange} value={props.email} error={true}
                               required={true} variant="outlined"
                               helperText="This email is already registered. Click the LOGIN button above to login."
                               InputProps={{
                                   classes: {
                                       input: classes.textField
                                   }
                               }}
                    />
                </div>
            );
        } else return (
            <div>
                <TextField name="email" label="Email" onChange={props.onChange} value={props.email} error={false}
                           required={true} variant="outlined" helperText="This must be a valid email"
                           InputProps={{
                               classes: {
                                   input: classes.textField
                               }
                           }}
                />
            </div>
        );
    }
}

class NameInput extends Component {
                render() {
                    const props = this.props;
                    const classes = props.classes;

                    if(props.nameLengthError) {
                        return (
                            <div>
                                <TextField name={props.nameType} label={props.label} onChange={props.onChange}
                                           value={props.nameValue} error={true} required={true} variant="outlined"
                                           helperText="Cannot be empty"
                                           InputProps={{
                                               classes: {
                                                   input: classes.textField
                                               }
                                           }}
                                />
                            </div>
                        );
                    }
                    return (
                        <div>
                            <TextField name={props.nameType} label={props.label} onChange={props.onChange}
                                       value={props.nameValue} error={false} required={true} variant="outlined"
                                       InputProps={{
                                           classes: {
                                               input: classes.textField
                                           }
                                       }}
                            />
                        </div>
                    );
                }
}

class PasswordInput extends Component {
    render() {
        const props = this.props;
        const classes = props.classes;

        if(props.passLengthError) {
            return (
                <div>
                    <TextField name="password" label="Password" onChange={props.onChange} type="password"
                               value={props.password} error={true} required={true} variant="outlined"
                               helperText="Must be at least 8 characters"
                               InputProps={{
                                   classes: {
                                       input: classes.textField
                                   }
                               }}
                    />
                </div>
            );
        }
        return (
            <div>
                <TextField name="password" label="Password" onChange={props.onChange} type="password"
                           value={props.password} error={false} required={true} variant="outlined"
                           helperText="Must be at least 8 characters"
                           InputProps={{
                               classes: {
                                   input: classes.textField
                               }
                           }}
                />
            </div>
        );
    }
}

class PasswordConfirmInput extends Component {
    render() {
        const props = this.props;
        const classes = props.classes;

        if(props.passMatchError) {
            return (
                <div>
                    <TextField name="password2" label="Confirm Password" onChange={props.onChange} type="password"
                               value={props.password} error={true} required={true} variant="outlined"
                               helperText="The passwords must match"
                               InputProps={{
                                   classes: {
                                       input: classes.textField
                                   }
                               }}
                    />
                </div>
            );
        }
        return (
            <div>
                <TextField name="password2" label="Confirm Password" onChange={props.onChange} type="password"
                           value={props.password} error={false} required={true} variant="outlined"
                           InputProps={{
                               classes: {
                                   input: classes.textField
                               }
                           }}
                />
            </div>
        );
    }
}

AccountCreator.propTypes = {
    classes: PropTypes.any.isRequired,
    createAccount: PropTypes.func.isRequired
};

export default compose(withStyles(styles), connect(null, {createAccount}))(AccountCreator);

