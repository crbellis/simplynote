import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Notepad from "../Notepad/Notepad";
import classes from "./Layout.module.css";

const Layout = (props) => {
    return (
        <div className={classes.Layout}>
            <Sidebar notes={props.notes} />
            <Notepad
                notes={props.notes}
                id={props.match.params.id}
                url={props.match.url}
                setNotes={props.setNotes}
            />
        </div>
    );
};

export default Layout;
