import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';

import AccountCreator from "../AccountAccess/AccountCreator";
import LoginComponent from "../AccountAccess/LoginComponent";
import UserProfile from "./UserProfile";
import Home from "./Home";
import NotificationPostPage from "./NotificationPostPage";

const mapStateToProps = state => ({
    displayPage: state.navigation.displayPage,
    isLoggedIn: state.accountAccess.isLoggedIn
});

class DisplayArea extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.display = 'create_account';
    };

    render() {
        switch (this.props.displayPage) {
            case 'create_account':
                this.display = (
                    <AccountCreator/>
                );
                break;
            case 'login':
                if(this.props.isLoggedIn) {
                    this.display = (
                        <Home/>
                    )
                } else {
                    this.display = (
                        <LoginComponent/>
                    );
                }
                break;
            case 'home':
                this.display = (
                    <Home/>
                );
                break;
            // case 'about': This will be a page about the simple social network, myself and
            //               some of the things I've learned while building it
            //     displayPage = (
            //
            //     );
            //     break;
            case 'notificationPost':
                this.display = (
                    <NotificationPostPage/>
                );
                break;
            default: //displays the user profile
                this.display = (
                    <UserProfile targetUser={this.props.displayPage}/>
                );
        }
        return (
            <div>
                {this.display}
            </div>
        );
    }
}

DisplayArea.propTypes = {
    displayPage: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.bool.isRequired
};

export default connect(mapStateToProps, {})(DisplayArea);