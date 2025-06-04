// seed production 
NODE_ENV=production node seedQuraanData.js

// seed local
node seedQuraanData.js

// run local
nodemon index.js

// postman local 
http://localhost:3900/api/readings/by-key

// postman production

https://holyquraan-api-production.up.railway.app/api/readings/by-key