import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { doSignOut } from '../auth';

const Home = () => {
    const navigate = useNavigate();
    const { userLoggedIn, currentUser } = useAuth();

    return (
        <>
            <div className="bodyFlex">
                <div className="container">
                    {userLoggedIn ? (
                        <>
                            Hello {currentUser.displayName ? currentUser.displayName : currentUser.email} <br />
                            <Link to={'/tamagotchi'}>Inizia</Link>
                            {/* <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Sign Out</button> */}
                        </>
                    ) : (
                        <>
                            <Link to={'/login'}>Login</Link>
                            <Link to={'/signup'}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
