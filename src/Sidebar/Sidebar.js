import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./Sidebar.module.css";
import new_note from "../Assets/SVGs/file_new.svg";
import moment from "moment";

const Sidebar = (props) => {
    let notes = null;
    if (props.notes) {
        notes = props.notes.sort(
            (a, b) => b["timestamp"]["$date"] - a["timestamp"]["$date"]
        );
        notes = notes.map((note, index) => {
            let date = new Date(note.timestamp.$date);
            let side_note =
                note.note.length > 28
                    ? note.note.substr(0, 28 - 1) + "..."
                    : note.note;
            return (
                <NavLink
                    className={classes.Link}
                    to={"/notes/" + note["_id"]["$oid"]}
                    key={index}
                >
                    <div className={classes.SideNote}>
                        <div className={classes.Name} line={1}>
                            {note.note_name}
                        </div>
                        <div className={classes.Note}>{side_note}</div>
                        <div>
                            {moment.utc(date).local().format("MM/DD/YYYY LT")}
                        </div>
                    </div>
                </NavLink>
            );
        });
    }

    return (
        <div className={classes.Sidebar}>
            <div className={classes.Header}>
                Notes
                <NavLink className={classes.NewNote} to="/notes/">
                    <img src={new_note} alt="note" fill="#fffff"></img>
                </NavLink>
            </div>
            {notes}
        </div>
    );
};

export default Sidebar;
