import React from "react";
import classes from "./SignUp.module.css";
import axios from "axios";
import { NavLink, useHistory } from "react-router-dom";

const SignUp = (props) => {
    const [user, setUser] = React.useState({});
    const [emailInUse, setEmailInUse] = React.useState(false);
    const history = useHistory();
    const handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        let new_user = { ...user };
        new_user[name] = value;
        setUser(new_user);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // props.setAuth(true);
        axios
            .post("/api/signup", {
                email: user["email"],
                password: user["password"],
            })
            .then((response) => {
                console.log(response.status);
                if (response.status === 200) {
                    console.log("returning");
                    history.push("/login");
                }
            })
            .catch((error) => {
                if (error.response.status === 409) {
                    setEmailInUse(true);
                }
            });
    };
    let passwordMismatch = null;
    let underlineColor = "rgb(83, 160, 233)";
    let disabledSignup = false;
    let reg = /^[a-zA-Z0-9\.]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
    if (user["password"] !== user["confirmed_password"]) {
        passwordMismatch = (
            <p style={{ color: "red", margin: "2px", fontSize: "0.75rem" }}>
                Passwords do not match.
            </p>
        );
        underlineColor = "red";
        disabledSignup = true;
    }

    if (!reg.test(user["email"])) {
        disabledSignup = true;
    }
    return (
        <div className={classes.Background}>
            <div className={classes.Card}>
                <form className={classes.Form} onSubmit={handleSubmit}>
                    {emailInUse ? (
                        <div className={classes.EmailInUse}>
                            Email is already in use.{" "}
                            <NavLink className={classes.Link} to="/login">
                                Login?
                            </NavLink>
                        </div>
                    ) : (
                        ""
                    )}
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
                        <span
                            className={classes.Underline}
                            style={{ backgroundColor: underlineColor }}
                        ></span>
                    </div>
                    <label className={classes.Label}>Confirm Password: </label>
                    <div className={classes.InputDiv}>
                        <input
                            className={classes.Input}
                            type="password"
                            placeholder="password"
                            name="confirmed_password"
                            onChange={handleChange}
                        ></input>
                        <span
                            className={classes.Underline}
                            style={{ backgroundColor: underlineColor }}
                        ></span>
                    </div>
                    {passwordMismatch}
                    <div className={classes.UserMethods}>
                        <input
                            type="submit"
                            value="Signup"
                            className={classes.SignUp}
                            disabled={disabledSignup}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
