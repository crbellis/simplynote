import React from "react";
import classes from "./Notepad.module.css";
import { useHistory } from "react-router-dom";
import useIsMount from "../Utilities/MountRef/MountRef";
import moment from "moment";
import trash from "../Assets/SVGs/trash_full.svg";

import axios from "axios";

const Notepad = (props) => {
    const [noteData, setNoteData] = React.useState({
        id: null,
        note_name: "",
        note: "",
    });
    const [lastSaved, setLastSaved] = React.useState({ time: null });
    const isMount = useIsMount();
    let history = useHistory();

    const handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        let newNoteData = { ...noteData };
        newNoteData[name] = value;
        setNoteData(newNoteData);
    };

    const noteCompare = (note_1, note_2) => {
        return (
            note_1["note_name"] === note_2["note_name"] &&
            note_1["note"] === note_2["note"]
        );
    };

    const deleteNote = () => {
        axios
            .delete("/api/delete/noteid=" + noteData["id"])
            .then((response) => {
                if (response.status === 200) {
                    axios.get("/api/getnotes").then((response) => {
                        props.setNotes(response.data.notes);
                        history.push("/notes/");
                    });
                }
            });
    };

    // if user has notes and an id exists (in url), set the current data to the
    // note with that id
    React.useEffect(() => {
        if (props.notes !== undefined && props.id) {
            let selected_note = props.notes.find(
                (note) => note["_id"]["$oid"] === props.id
            );
            // handling wrong note_id -> redirect back to /notes/
            if (selected_note === undefined) {
                history.push("/notes/");
                return;
            }
            setNoteData({
                id: props.id,
                note_name: selected_note["note_name"],
                note: selected_note["note"],
            });

            setLastSaved({
                time: `Last saved: ${moment
                    .utc(selected_note["timestamp"]["$date"])
                    .local()
                    .format("MM/DD/YYYY LT")}`,
            });
        }
    }, [props.notes, props.id, history]);

    // Autosave - checks for component mount and if the state is empty
    React.useEffect(() => {
        // temp note
        let _note = { note_name: "", note: "" };
        // checks for current notes, if notes exist continue
        if (props.notes !== undefined && props.id) {
            // sets temp note to note with id === props.id
            _note = props.notes.find(
                (note) => note["_id"]["$oid"] === props.id
            );
            if (_note !== undefined) {
                _note = { note_name: _note["note_name"], note: _note["note"] };
            }
        }

        // if the components first mount and if there is a difference
        // between temp note and noteData (data being rendered in notepad)
        // save note if there are any changes, then refresh the notes data
        if (!isMount && !noteCompare(_note, noteData)) {
            let body = props.id
                ? { _id: props.id, ...noteData }
                : { ...noteData };
            const timeOutId = setTimeout(
                () =>
                    axios
                        .post("/api/savenote", {
                            body,
                        })
                        .then((response) => {
                            let new_note_id = response.data._id;
                            if (response.status === 200) {
                                axios.get("/api/getnotes").then((response) => {
                                    props.setNotes(response.data.notes);
                                    history.push("/notes/" + new_note_id);
                                });
                            }
                        }),
                // convert to seconds
                2000
            );
            return () => clearTimeout(timeOutId);
        }
    }, [noteData, isMount, props, history]);

    return (
        <div className={classes.Notepad}>
            <textarea
                className={classes.Header}
                rows="0"
                maxLength="135"
                placeholder="Name your note"
                name="note_name"
                onChange={handleChange}
                value={noteData["note_name"]}
            ></textarea>
            <button className={classes.Trash} onClick={deleteNote}>
                <img src={trash} alt="trash"></img>
            </button>
            <div className={classes.autoSave}>{lastSaved["time"]}</div>
            <textarea
                className={classes.NoteArea}
                name="note"
                spellCheck="true"
                placeholder="Enter your note here"
                onChange={handleChange}
                value={noteData["note"]}
            ></textarea>
        </div>
    );
};

export default Notepad;
