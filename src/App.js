import "./App.css";
import React from "react";
import Login from "./Login/Login";
import SignUp from "./SignUp/SignUp";
import Layout from "./Layout/Layout";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import axios from "axios";

function App(props) {
    const [isAuthed, setAuth] = React.useState();
    const [notes, setNotes] = React.useState();

    React.useEffect(() => {
        axios
            .get("/api/checkSession")
            .then((response) => {
                if (response.status === 200) {
                    setAuth(true);
                    return <Redirect to="/notes/" />;
                }
            })
            .catch((error) => {
                console.log(error);
                setAuth(false);
            });
    }, [props]);

    React.useEffect(() => {
        if (isAuthed) {
            axios.get("/api/getnotes").then((response) => {
                setNotes(response.data.notes);
            });
        }
    }, [isAuthed]);

    if (isAuthed === undefined) {
        return <div></div>;
    }
    return (
        <div className="App">
            <BrowserRouter>
                <Switch>
                    <Route
                        exact
                        path="/login"
                        component={(props) => (
                            <Login setAuth={setAuth} isAuthed={isAuthed} />
                        )}
                    />
                    <Route path="/signup" component={SignUp} />
                    <ProtectedRoute
                        exact
                        path="/"
                        component={(props) => (
                            <Layout
                                notes={notes}
                                match={props.match}
                                setNotes={setNotes}
                            />
                        )}
                        isAuthed={isAuthed}
                    />
                    <ProtectedRoute
                        exact
                        path="/notes/"
                        component={(props) => (
                            <Layout
                                notes={notes}
                                match={props.match}
                                setNotes={setNotes}
                            />
                        )}
                        isAuthed={isAuthed}
                    />
                    <ProtectedRoute
                        path="/notes/:id"
                        component={(props) => (
                            <Layout
                                notes={notes}
                                match={props.match}
                                setNotes={setNotes}
                            />
                        )}
                        isAuthed={isAuthed}
                    />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;
