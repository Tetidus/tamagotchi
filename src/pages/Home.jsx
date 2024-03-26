import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { doSignOut } from '../auth';

const Home = () => {
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();

  return (
    <>
      {userLoggedIn ? (
        <>
          Hello {currentUser.displayName ? currentUser.displayName : currentUser.email} <br />
          <Link to={'/tamagotchi'}>Inizia</Link>
        </>
      ) : (
        <>
          <Link to={'/login'}>Login</Link>
          <Link to={'/signup'}>Sign Up</Link>
        </>
      )}

      {/* <h1>ciao</h1> */}
    </>
  );
};

export default Home;
          {/* <button onClick={() => { doSignOut().then(() => { navigate('./login') }) }}>Sign Out</button> */}
