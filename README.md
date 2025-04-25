# Randy Pospisil Personal Site 

## Explanation for Kirkwood - Web Languages 2025SP CRF01

### Grading Rubric
#### 1. React Implementation (25 points)
- Component Structure (10 pts): Uses functional components effectively, breaking down the UI into reusable parts.

I organized this site under the src directory with a directory called `pages` where I had a separate .jsx file for every page that would be in the router. I used `src/index.js` as my main routing page, but had a separate component `pages/Home.jsx` for the home page. I used a `pages/Layout.jsx` and `pages/Footer.jsx` pages to keep headers, footers, and navigation which was imported into each page. 

- State Management & Hooks (10 pts): Proper use of useState, useEffect, or other hooks where necessary.

I used useState to set variables for capturing form data for my Login page and to capture changes for loading pictures in my Pictures.jsx and SinglePic.jsx. I used useEffect on my Pictures and SinglePage pages to call the API on my server to retrieve picture data.

- Routing (5 pts): Implements React Router for navigation between pages.

I implemented React Router in `src/index.js`. I also implemented a simple login using session storage to hide pictures from non-users, and then used the Router to direct people trying to access the pictures to a log in screen.

#### 2. JavaScript Functionality (20 points)
- Interactivity (10 pts): Implements features like a theme toggle, form validation, or project filtering.

I implemented javascript functionality with my login screen and the pictures and writing API found in `server/server.js`. I also implemented buttons to navigate through the pictures and display the writing.

- Code Quality (10 pts): Uses clean, efficient JavaScript with proper ES6+ syntax (e.g., arrow functions, destructuring).

I used arrow functions in my .jsx files, I made utility files to split out functions that could be used in various places. For instance, I have login functions in `client/src/utils/Utils.js` and database functions in `server/utils/sharedutils.js`.

#### 3. Sass Styling (20 points)
- Use of Sass Features (10 pts): Demonstrates nesting, mixins, variables, and partials.

I split my sass into components, globals, and utils. In components I had .scss files for layout to house styles that were appropriate for all pages (header, footer, etc), main for styles in the `<main>` node, and specific files like pics and writing for important styling that was in the `<main>` node but unique to that page. I had mixins for breakpoints in my `util` directory, I kept color variables in the `globals/_colors.scss` file. Though I didn't use partials, I know how to use them. I just found that variables are easier to maintain, so I chose not to use them. For the sake of class, a partial is defined in an .scss file with a `$` like

```
$primary-color:#FFFFFF
$secondary-color:#000000
```
then you import the .scss and use the variable in the place that value would be used, like 

```
.primary-button{
    @include button-style($primary-color,white)
}
```

I didn't do this because I found using `var(--variable-name)` much easier to maintain.

- Responsive Design (10 pts): Ensures mobile and desktop compatibility using media queries and flexible layouts.

I designed this site as mobile first and then used media queries to adjust for desktop. For instance, the home page has my headshot on the left with text to the right, but on mobile the headshot is at the top and centered. Also for the pictures on desktop there are 15 images shown at a time but on mobile there are 10.


#### 4. UI/UX & Accessibility (15 points)
- Visual Design (10 pts): The layout is visually appealing and well-structured.

I used images where I thought appropriate and picked fonts and colors that I thought represent me well. I have buttons that are easy to hit on mobile and navigation at the top.  

- Accessibility (5 pts): Implements good contrast, alt text for images, and semantic HTML where applicable.

I used semantic HTML to designate main and articles. I made sure my colors were good for contrast. I used alt for images not in the pictures interface. In there I added alt text for images that have keywords. I ran the WAVE accesibility tool on my site and have no errors.

#### 5. Code Quality & Best Practices (10 points)
- Folder Structure (5 pts): Properly organized with separate folders for components, styles, and assets.

I used folders for various components, styles and assets.

- Clean Code (5 pts): Uses meaningful variable names, comments, and follows best practices.

I used meaningful variable names. I used comments in code where the code did not obviously describe itself, such as in `server/server.js`.

#### 6. Deployment & Documentation (10 points)
- Live Demo (5 pts): Deployed on a hosting platform (Netlify, Vercel, or GitHub Pages).

I talked to Jordon about deploying on my home server instead of a hosting platform. I have this site deployed to a Docker container.

- README File (5 pts): Includes project setup instructions, features, and a brief explanation of the stack used.

This file is the Readme.

## Set Up

### Assumptions

This site will use photos, writings, and a sqlite database in a directory outside of the Docker container. This way photos and writings can be added without recreating the container.

The writings should be in Markdown format with the first line of each file as

```
# **Title**
```

The site also assumes that a reverse proxy server like nginx is running that will route traffic from ports 3000 and 6125. For my reverse proxy server my /etc/nginx/sites-available/reverse-proxy is

```
server {
   server_name posis.me;
   
   location /api/ {
        proxy_pass http://127.0.0.1:6125/;
        proxy_http_version 1.1;
   }
   location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
   }
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/posis.me/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/posis.me/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = posis.me) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


server_name posis.me;
    listen 80;
    return 404; # managed by Certbot


}
```

### Docker

The docker-compose.yml should be updated to mount correctly the folders. Change the `device` under each volume to go to the correct folder on your server.

Run `docker-compose build` to build the Docker container and then `docker-compose up` to run it. The site will run on port 3000 so you might look at localhost:3000 but I would set up the reverse proxy server if possible.
