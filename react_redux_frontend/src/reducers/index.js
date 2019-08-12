import {combineReducers} from 'redux';
import postReducer from './postReducer';
import AccountAccessReducer from './accountAccessReducer';
import NavigationReducer from './navigationReducer'
import PopoutReducer from './popoutReducer';
import FriendReducer from './friendReducer';
import userReducer from './userReducer';
import imageReducer from './imageReducer';

export default combineReducers({
    posts: postReducer,
    accountAccess: AccountAccessReducer,
    navigation: NavigationReducer,
    popout: PopoutReducer,
    friendAccess: FriendReducer,
    users: userReducer,
    images: imageReducer
});