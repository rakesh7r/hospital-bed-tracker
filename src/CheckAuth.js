import React, { useState, useEffect } from "react"
import fire from "./Config/fire"
import Login from "./Login"
import HospitalPanel from "./HospitalPanel"
import firebase from "firebase"

const CheckAuth = () => {
    const [user, setUser] = useState(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [hospitalName, setHospitalName] = useState("")
    const [hospitalArea, setHospitalArea] = useState("")
    const [hospitalDistrict, setHospitalDistrict] = useState("")
    const [verifyPassword, setVerifyPassword] = useState("")
    const [hasAccount, setHasAccount] = useState(true)

    const handleLogin = () => {
        clearErrors()
        fire.auth()
            .signInWithEmailAndPassword(email, password)
            .catch((err) => {
                switch (err.code) {
                    case "auth/invalid-email":
                    case "auth/user-disabled":
                    case "auth/user-not-defined":
                        setEmailError(err.message)
                        break
                    case "auth/wrong-password":
                        setPasswordError(err.message)
                        break
                    default:
                        break
                }
            })
    }

    const handleSignup = () => {
        if (hospitalName.length === 0) {
            setEmailError("Enter Hospital Name")
            return false
        }
        if (password !== verifyPassword) {
            setEmailError("Password mismatched!")
            return false
        }
        if (hospitalArea === "") {
            setEmailError("No Mandal/Area Selected!")
            return false
        }
        clearErrors()
        const dt = new Date().toJSON().slice(0, 10)
        // const date = new Date().toJSON().slice(0, 10).replaceAll("-", "")
        fire.auth()
            .createUserWithEmailAndPassword(email, password)
            .then((user) => {
                fire.firestore()
                    .collection("hospitals")
                    .doc(email)
                    .set({
                        name: hospitalName,
                        mandal: hospitalArea,
                        district: hospitalDistrict,
                        beds: {
                            available: 0,
                            total: 0,
                        },
                        oxygen: {
                            Available: 0,
                            lastsFor: 0,
                        },
                        ventilators: 0,
                        totalPatients: 0,
                        date: dt,
                        patients: {
                            deaths: 0,
                            discharged: 0,
                            positive: 0,
                            recovered: 0,
                        },
                        daytoday: [],
                        isVaccinationCenter: false,
                        isPHC: false,
                        isPrivate: false,
                        covaxin: 0,
                        covishield: 0,
                        remedesivir: 0,
                    })
                fire.firestore()
                    .collection("hopital-names")
                    .doc("names")
                    .set({
                        names: firebase.firestore.FieldValue.arrayUnion(
                            hospitalName
                        ),
                    })
            })
            .catch((err) => {
                switch (err.code) {
                    case "auth/email-already-in-use":
                    case "auth/invalid-email":
                        setEmailError(err.message)
                        break
                    case "auth/weak-password":
                        setPasswordError(err.message)
                        break
                    default:
                        break
                }
            })
    }

    useEffect(() => {
        const unsubscribe = fire.auth().onAuthStateChanged((user) => {
            if (user) {
                clearInputs()
                setUser(user)
            } else setUser(null)
        })
        return () => {
            unsubscribe()
        }
    }, [])

    const handleLogout = () => {
        fire.auth().signOut()
    }
    const clearInputs = () => {
        setUser("")
        setPassword("")
    }
    const clearErrors = () => {
        setEmailError("")
        setPasswordError("")
    }
    return (
        <div>
            {!user ? (
                <Login
                    email={email}
                    password={password}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    handleSignup={handleSignup}
                    handleLogin={handleLogin}
                    clearErrors={clearErrors}
                    clearInputs={clearInputs}
                    hasAccount={hasAccount}
                    setHasAccount={setHasAccount}
                    emailError={emailError}
                    passwordError={passwordError}
                    hospitalName={hospitalName}
                    hospitalArea={hospitalArea}
                    hospitalDistrict={hospitalDistrict}
                    verifyPassword={verifyPassword}
                    setHospitalName={setHospitalName}
                    setHospitalArea={setHospitalArea}
                    setHospitalDistrict={setHospitalDistrict}
                    setVerifyPassword={setVerifyPassword}
                />
            ) : (
                <HospitalPanel user={user} handleLogout={handleLogout} />
            )}
        </div>
    )
}

export default CheckAuth
