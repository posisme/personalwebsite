import { useState } from 'react';
const Utils = {


    isMobile: () => {
        const userAgent = navigator.userAgent;
        return /Android|iOS|Mobile/i.test(userAgent);
    },
    useToken: () => {
      // Initialize loginmessage once
      const [loginmessage, setMessage] = useState("Not Logged In");
    
      const getToken = () => {
        const tokenString = sessionStorage.getItem('token');
        const userToken = tokenString ? JSON.parse(tokenString) : null;
        return userToken;
      };
    
      const [token, setToken] = useState(getToken());
    
      const saveToken = (userToken) => {
        if (userToken && userToken.name) {
          sessionStorage.setItem('token', JSON.stringify(userToken));
          setToken(userToken);
          setMessage("yep");
          return; // Exit the function after setting "yep"
        }
        setMessage("Wrong Credentials. Not logged in.");
      };
    
      return {
        setToken: saveToken,
        token,
        loginmessage
      };
    }
};

export default Utils;