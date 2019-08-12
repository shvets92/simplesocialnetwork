import React, {Component} from 'react';
import PropTypes from 'prop-types';
import connect from "react-redux/es/connect/connect";
import {fetchImage} from "../../actions/imageActions";

const mapStateToProps = state => ({
    requestedImages: state.images.requestedImages,
    requestCounterTrigger: state.images.requestCounterTrigger,
    authToken: state.accountAccess.authToken,
    isLoggedIn: state.accountAccess.isLoggedIn
});

class ImageFetcher extends Component {
    constructor(props) {
        super(props);
        this.fetching = {};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const props = this.props;
        if(props.requestCounterTrigger !== prevProps.requestCounterTrigger) {
            if(props.requestedImages.length > 0) {
                while(props.requestedImages.length > 0) {
                    let request = props.requestedImages.shift();
                    if(this.fetching[request.uri] === undefined) {
                        this.fetching[request.uri] = true;
                        props.fetchImage(request.uri, props.authToken, request.type);
                    }
                }
            }
        }
        if(!props.isLoggedIn) {
            this.fetching = {};
        }
    }

    render() {
        return (
            <div/>
        );
    }
}

ImageFetcher.propTypes = {
    requestedImages: PropTypes.array.isRequired,
    requestCounterTrigger: PropTypes.number.isRequired,
    fetchImage: PropTypes.func.isRequired,
    authToken: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired
};

export default connect(mapStateToProps, {fetchImage})(ImageFetcher);