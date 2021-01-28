import React from "react";
import { NavLink, Redirect, useLocation } from "react-router-dom";
import classes from "./Login.module.css";
import axios from "axios";

const Login = (props) => {
    let credentialStatus = null;
    const [isValidCred, setIsValid] = React.useState(true);
    const [user, setUser] = React.useState({ email: null, password: null });

    const { state } = useLocation();

    if (props.isAuthed) {
        return <Redirect to={state?.from || "/notes/"} />;
    }

    const handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        let new_user = { ...user };
        new_user[name] = value;
        setUser(new_user);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios
            .post("api/login", { ...user })
            .then((response) => {
                if (response.status === 200) {
                    props.setAuth(true);
                }
            })
            .catch((error) => {
                console.log(error.response);
                if (error.response.status === 401) {
                    setIsValid(false);
                }
            });
    };

    let disabledLogin = true;
    let reg = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
    if (
        user["email"] !== null &&
        user["password"] !== null &&
        reg.test(user["email"])
    ) {
        disabledLogin = false;
    }

    if (!isValidCred) {
        credentialStatus = (
            <p
                style={{
                    color: "red",
                    margin: "2px",
                    fontSize: "0.75rem",
                }}
            >
                Invalid email or password.
            </p>
        );
    }

    return (
        <div className={classes.Background}>
            <div className={classes.Card}>
                <form className={classes.Form} onSubmit={handleSubmit}>
                    {credentialStatus}
                    <label className={classes.Label}>Email: </label>
                    <div className={classes.InputDiv}>
                        <input
                            className={classes.Input}
                            type="email"
                            placeholder="email"
                            name="email"
                            onChange={handleChange}
                        />
                        <span className={classes.Underline}></span>
                    </div>
                    <label className={classes.Label}>Password: </label>
                    <div className={classes.InputDiv}>
                        <input
                            className={classes.Input}
                            type="password"
                            placeholder="password"
                            name="password"
                            onChange={handleChange}
                        ></input>
                        <span className={classes.Underline}></span>
                    </div>
                    <div className={classes.UserMethods}>
                        <input
                            className={classes.Login}
                            type="submit"
                            value="Login"
                            disabled={disabledLogin}
                        />
                    </div>
                    <p className={classes.SignUp}>
                        Need an account?{" "}
                        <NavLink className={classes.Link} to="/signup">
                            Sign up
                        </NavLink>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
