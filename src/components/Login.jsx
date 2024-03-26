import React from 'react'
import { useState } from 'react';
import { auth } from '../firebase';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../auth';
import { useAuth } from '../authContext';
import { Navigate, useNavigate } from 'react-router-dom';

const Login = () => { 

    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState()

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            await doSignInWithEmailAndPassword(email, password)
        }
    }

    const onGoogleSignIn = (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            doSignInWithGoogle().catch(err => {
                setIsSigningIn(false)
            })
        }
    }

    const handleLogin = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Login riuscito
        } catch (error) {
            console.error(error.message);
        }
    };


    return (
        <>
        {userLoggedIn && (<Navigate to={'/tamagotchi'} replace={true} />)}
            <form onSubmit={onSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" disabled={isSigningIn} onClick={handleLogin}>{isSigningIn ? 'Signing in...' : 'Sign in'}</button>
                <button onClick={(e) => { onGoogleSignIn(e) }}>{isSigningIn ? 'Signing in...' : 'Continua con Google'}</button>
            </form>
        </>
    )
}

export default Login