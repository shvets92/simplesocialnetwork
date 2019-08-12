import {createMuiTheme} from '@material-ui/core/styles';
import deepPurple from "@material-ui/core/colors/deepPurple";
import yellow from "@material-ui/core/colors/yellow";

export default createMuiTheme({
    palette: {
        primary: deepPurple,
        secondary: yellow,
        background: {
            default: "#eeeeee",
        },
    },
    typography: {
        useNextVariants: true,
    },
});
