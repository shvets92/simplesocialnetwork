import {OPEN_POPOUT} from "./types";

export const openPopout = (anchorEl, content, offset) => dispatch => {
    let getOffset = offset;

    if(offset) {
        getOffset = offset
    } else {
        getOffset = 0;
    }

    dispatch({
        type: OPEN_POPOUT,
        payload: {
            anchorEl: anchorEl,
            content: content,
            offset: getOffset
        }
    });
};