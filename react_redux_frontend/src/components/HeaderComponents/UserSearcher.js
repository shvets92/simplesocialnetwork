import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import SearchIcon from "@material-ui/icons/SearchRounded";
import InputBase from "@material-ui/core/es/InputBase";
import Button from "@material-ui/core/es/Button/Button";
import {searchUsers} from "../../actions/userActions";

const styles = theme => ({
    componentContainer: {
        width: 400
    },
    textField: {
        paddingLeft: 16,
        fontFamily: 'PTSansRegular',
        fontSize: 16,
        color: theme.palette.primary.main
    }
});

const mapStateToProps = state => ({
    authToken: state.accountAccess.authToken
});

class UserSearcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: ''
        };

        this.input = null;

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.input = document.getElementById("userSearch");
        this.input.addEventListener("keyup", (e)=>{
            if(e.code === "Enter") {
                this.onSubmit();
            }
        })
    }
    componentWillUnmount() {
        this.input.removeEventListener("keyup", (e)=>{
            if(e.code === "Enter") {
                this.onSubmit();
            }
        })
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    };
    onSubmit = () => {
        if(this.state.text.length < 1) {
            return;
        }
        this.props.searchUsers(this.state.text, this.props.authToken);
    };

    render() {
        const classes = this.props.classes;

        return (
            <div className={classes.componentContainer}>
                <Grid container direction="row" alignItems="center" justify="center">

                    <Grid xs item>
                            <InputBase className={classes.textField} placeholder="Search by email or name"
                                       multiline={false} fullWidth={true} autoComplete="off" name="text"
                                       onChange={this.onChange} value={this.state.text} id={"userSearch"}
                            />
                    </Grid>
                    <Grid item>
                        <Button onClick={this.onSubmit} disableRipple={true} color="primary">
                            <SearchIcon/>
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

UserSearcher.propTypes = {
    classes: PropTypes.any.isRequired,
    searchUsers: PropTypes.func.isRequired,
    authToken: PropTypes.string.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, {searchUsers}))(UserSearcher);