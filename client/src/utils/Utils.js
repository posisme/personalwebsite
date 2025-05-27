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
    },
    levenshteinDistance: (s1,s2) =>{
      const m = s1.length;
      const n = s2.length;
      const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null));

      for (let i = 0; i <= m; i++) {
          dp[i][0] = i;
      }
      for (let j = 0; j <= n; j++) {
          dp[0][j] = j;
      }

      for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
              const cost = (s1[i - 1] === s2[j - 1]) ? 0 : 1;
              dp[i][j] = Math.min(
                  dp[i - 1][j] + 1,      // Deletion
                  dp[i][j - 1] + 1,      // Insertion
                  dp[i - 1][j - 1] + cost // Substitution
              );
          }
      }
      return dp[m][n];
    }
};

export default Utils;