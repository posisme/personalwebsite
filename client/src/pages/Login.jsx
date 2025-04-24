import Layout from "./Layout";
import Footer from "./Footer";
import PropTypes from 'prop-types';
import {useState} from 'react';

async function loginUser(credentials) {
    return fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json())
   }

const Login = ({ setToken, loginmessage }) => {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();

    const handleSubmit = async e => {
        e.preventDefault();
        const token = await loginUser({
          username,
          password
        });
        setToken(token);
      }

    return(
        <>
        <Layout />
        <main className="main">
          <div className="main__wrapper wrapper">
            <div id="loginmessage">{loginmessage}</div>
            <form id="loginform" onSubmit={handleSubmit}>
                <h2>Please log in to view this page</h2>
                <label htmlFor="username">
                <p>Username</p>
                <input id="username" type="text" onChange={e => setUserName(e.target.value)}/>
                </label>
                <label htmlFor="password">
                <p>Password</p>
                <input id="password" type="password" onChange={e => setPassword(e.target.value)}/>
                </label>
                <div>
                <button type="submit">Submit</button>
                </div>
            </form>
          </div>
        </main>
      <Footer />
      </>
    )
  }

  Login.propTypes = {
    setToken: PropTypes.func.isRequired
  }
  export default Login;