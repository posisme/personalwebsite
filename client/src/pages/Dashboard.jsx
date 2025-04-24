import Layout from "./Layout";
import Footer from "./Footer";
import PropTypes from 'prop-types';
import {useState} from 'react';

async function createUser(credentials) {
    return fetch('/api/setlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json())
   }

const Dashboard = () => {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();

    const handleSubmit = async e => {
        e.preventDefault();
        const token = await createUser({
          username,
          password,
          name,
          email
        });
      }

    return(
        <>
        <Layout />
        <main className="main">
          <div className="main__wrapper wrapper">
            <form id="createuser" onSubmit={handleSubmit}>
                <h2>Create User</h2>
                <label htmlFor="username">
                <p>Username</p>
                <input id="username" type="text" onChange={e => setUserName(e.target.value)}/>
                </label>
                <label htmlFor="password">
                <p>Password</p>
                <input id="password" type="password" onChange={e => setPassword(e.target.value)}/>
                </label>
                <label htmlFor="name">
                <p>Name</p>
                <input id="name" type="text" onChange={e => setName(e.target.value)}/>
                </label>
                <label htmlFor="email">
                <p>Email</p>
                <input id="email" type="text" onChange={e => setEmail(e.target.value)}/>
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

  
  export default Dashboard;