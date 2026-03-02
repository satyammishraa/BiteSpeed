<h1 align="center">🚀 Bitespeed Backend Task</h1>
<h2 align="center">Identity Reconciliation API</h2>

<p align="center">
  Node.js • Express • Prisma • PostgreSQL
</p>

<hr/>

<h2>📌 Overview</h2>

<p>
This project implements an <b>Identity Reconciliation Service</b> for Bitespeed.
The API identifies and links customer contacts using shared <code>email</code> and <code>phoneNumber</code>.
</p>

<ul>
  <li>Ensures one <b>Primary Contact</b> per customer</li>
  <li>Links all other contacts as <b>Secondary</b></li>
  <li>Oldest contact always remains primary</li>
  <li>Merges identities when two primaries get connected</li>
</ul>

<hr/>

<h2>🛠 Tech Stack</h2>

<ul>
  <li><b>Node.js</b></li>
  <li><b>Express.js</b></li>
  <li><b>Prisma ORM</b></li>
  <li><b>PostgreSQL</b></li>
  <li>Hosted on <b>Render</b></li>
</ul>

<hr/>

<h2>📂 Project Structure</h2>

<pre>
bitespeed/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   └── identify.controller.js
│   ├── services/
│   │   └── identify.service.js
│   ├── routes/
│   │   └── identify.route.js
│   └── app.js
│
├── .env
├── package.json
└── README.md
</pre>

<hr/>

<h2>🌐 API Endpoint</h2>

<h3>POST /identify</h3>

<b>Request Body (JSON)</b>

<pre>
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
</pre>

<p><b>Note:</b> At least one field must be provided.</p>

<hr/>

<h2>📤 Response Format</h2>

<pre>
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
</pre>

<hr/>

<h2>🧠 Identity Logic</h2>

<ol>
  <li>If no existing contact → Create new <b>Primary</b>.</li>
  <li>If match found → Fetch full linked identity cluster.</li>
  <li>Oldest primary remains primary.</li>
  <li>Newer primaries converted to secondary.</li>
  <li>New information creates new secondary contact.</li>
  <li>Final state is refetched before returning response.</li>
</ol>

<hr/>

<h2>🧪 Example Scenarios</h2>

<h3>1️⃣ New Contact</h3>

<pre>
Request:
{
  "email": "a@gmail.com",
  "phoneNumber": "111"
}
</pre>

<pre>
Response:
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["a@gmail.com"],
    "phoneNumbers": ["111"],
    "secondaryContactIds": []
  }
}
</pre>

<hr/>

<h3>2️⃣ Merge Two Primaries</h3>

<p>If two separate primary contacts become linked:</p>

<ul>
  <li>Oldest remains primary</li>
  <li>Newer becomes secondary</li>
  <li>All emails & phones consolidated</li>
</ul>

<hr/>

<h2>⚙️ Setup Instructions</h2>

<h3>1️⃣ Clone Repository</h3>

<pre>
git clone &lt;your-repo-link&gt;
cd bitespeed
</pre>

<h3>2️⃣ Install Dependencies</h3>

<pre>
npm install
</pre>

<h3>3️⃣ Add Environment Variables</h3>

<pre>
DATABASE_URL="your_postgresql_connection_string"
</pre>

<h3>4️⃣ Sync Database</h3>

<pre>
npx prisma db push
</pre>

<h3>5️⃣ Start Server</h3>

<pre>
npm start
</pre>

Server runs at:

<pre>
http://localhost:3000
</pre>

<hr/>

<h2>🚀 Deployment</h2>

<p>
Live API URL:
<br/>
<b>https://your-app-name.onrender.com/identify</b>
</p>

<hr/>

<h2>📌 Edge Cases Handled</h2>

<ul>
  <li>✔ No contact found</li>
  <li>✔ Same email, new phone</li>
  <li>✔ Same phone, new email</li>
  <li>✔ Merging two primaries</li>
  <li>✔ Idempotent repeated requests</li>
  <li>✔ Input validation</li>
</ul>

<hr/>

<h2>👨‍💻 Author</h2>

<p>
<b>Madan Mohan</b><br/>
Bitespeed Backend Assignment Submission
</p>
