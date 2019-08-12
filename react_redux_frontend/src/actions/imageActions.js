import {FETCH_IMAGE, POST_IMAGE, REQUEST_IMAGE_FETCH} from "./types";

export const postImage = (file, caption, authToken) => dispatch => {
    let data = new FormData();
    data.append('image', file);
    data.append('caption', caption);
    let headers = new Headers();
    headers.append('Authorization', authToken);

    fetch('/images', {
        method: 'POST',
        body: data,
        headers: headers
    }).then(response => {
        response.text().then(s3ImgUri => {
            dispatch({
                type: POST_IMAGE,
                payload: {
                    s3ImgUri: s3ImgUri,
                    localImgUrl: URL.createObjectURL(file)
                }
            })
        })
    })
};

export const fetchImage = (s3ImageUri, authToken, type) => dispatch => {
    if(s3ImageUri === undefined) {
        return;
    }

    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('type', type);

    fetch('/images/'+s3ImageUri, {
        method: 'GET',
        headers: headers
    }).then(response => {
        response.blob().then(blob => {
            let imgUrl = window.URL.createObjectURL(blob);
            dispatch({
                type: FETCH_IMAGE,
                payload: {
                    s3ImgUri: s3ImageUri,
                    localImgUrl: imgUrl
                }
            })
        });
    })
};

export const requestImageFetch = (s3ImageUri, type) => dispatch => {
    dispatch({
        type: REQUEST_IMAGE_FETCH,
        payload: {
            uri: s3ImageUri,
            type: type
        }
    })
};