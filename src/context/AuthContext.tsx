import { removeItem, setStore } from "../services/asyncStorage";
import React, { createContext, SetStateAction, useState, Dispatch, useContext } from "react";

interface UserDetails {
    parentType?: string,
    nameId?: string,
    name?: string,
    token?: string,
    type?: string,
    id?: string
}
interface UserContextProps {
    users: UserDetails,
    settingUsers: (users: UserDetails, userProfile?: any | null) => void,
    isLoggedIn: boolean,
    userProfile: any
}

const AuthContext = createContext<UserContextProps>({
    users: {},
    settingUsers: () => { },
    isLoggedIn: false,
    userProfile: {}
})

const useAuth = () => useContext(AuthContext)

let logoutFn: any = () => ''

const AuthProvider = ({ children }: any) => {

    const [users, setUsers] = useState<UserDetails>({
        nameId: '',
        name: '',
        token: '',
        type: '',
        parentType: '',
        id: ''
    })

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userProfile, setUserProfile] = useState({})

    const settingUsers = (users: UserDetails, userProfile: any = null) => {
        setUsers((prev) => ({ ...prev, ...users }))
        setIsLoggedIn(true)
        if (userProfile) {
            setUserProfile(userProfile)
        }
    }

    const logoutState = async () => {
        console.log('ME52RETAILERTESTING', "Calling logout from authcontext....")
        setUsers({ name: '', token: '', type: '', id: '' })
        setIsLoggedIn(false)
        setUserProfile({})
        await removeItem("userdetails")
        logoutFn = () => { }
    }

    logoutFn = logoutState

    return (
        <AuthContext.Provider value={{ users: users, settingUsers: settingUsers, isLoggedIn: isLoggedIn, userProfile: userProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

const getLogoutFn = () => logoutFn
export { useAuth, getLogoutFn }
export default AuthProvider
