import { useState } from 'react';
import { h } from 'hastscript';
import { map } from 'unist-util-map';

const mdredo = () => {

  const isDirectiveNode = (node) => {
    const { type, name } = node;
    if (name && name.match(/^[0-9]/)) {
      return false;
    }
    return type === 'textDirective' || type === 'leafDirective' || type === 'containerDirective';
  };
  const mapDirectiveNode = (node) => {

    if (isDirectiveNode(node)) {
      const { properties, tagName } = h(node.name, node.attributes);
      return Object.assign(Object.assign({}, node), {
        data: {
          hName: tagName,
          hProperties: properties
        }
      });
    }
    if (node.name && node.name.match(/^[0-9]/)) {
      let newnode = {
        type: "text",
        value: ":" + node.name,
        position: node.position
      }
      return newnode;
    }
    return node;
  };

  const transformNodeTree = (nodeTree) => map(nodeTree, mapDirectiveNode);
  const remarkDirectiveRehype = () => transformNodeTree;


  return remarkDirectiveRehype();
}

const Utils = {


  isMobile: () => {
    const userAgent = navigator.userAgent;
    return /Android|iOS|Mobile/i.test(userAgent);
  },
  useToken: () => {
    // Initialize loginmessage once
    const [loginmessage, setMessage] = useState("Not Logged In");

    const getToken = () => {
      const tokenString = localStorage.getItem('token');
      const userToken = tokenString ? JSON.parse(tokenString) : null;
      return userToken;
    };

    const [token, setToken] = useState(getToken());

    const saveToken = (userToken) => {
      if (userToken && userToken.name) {
        localStorage.setItem('token', JSON.stringify(userToken));
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
  yMD: (startdate, enddate) => {
    var retarr = [];
    let years, months, days;
    var startdate = new Date(startdate);
    var today = new Date(enddate ? enddate : new Date());
    if (startdate < today) {
      years = today.getFullYear() - startdate.getFullYear();
      months = today.getMonth() - startdate.getMonth();
      days = today.getDate() - startdate.getDate();

    }
    else {
      years = startdate.getFullYear() - today.getFullYear();
      months = startdate.getMonth() - today.getMonth();
      days = startdate.getDate() - today.getDate();
    }
    if (days < 0) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    var ret = [
      years > 1 ? years + " years" : (years == 1 ? years + " year" : null),
      months > 1 ? months + " months" : (months == 1 ? months + " month" : null),
      days > 1 ? days + " days" : (days == 1 ? days + " day" : null),
    ].filter((j) => j != null);
    var last = ret.pop();
    return ret.join(", ") + " and " + last;

  },
  levenshteinDistance: (s1, s2) => {
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
  },
  remarkDirectiveRehype: mdredo
};




export default Utils;