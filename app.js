import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const app = express();
const port = 6968;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Determine the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch completion from the v1/chat/completions endpoint
async function fetchCompletion(prompt, n_predict, stream) {
    const response = await fetch("http://^^^^^^^^^^^^", {
        method: 'POST',
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: '
                        Here are some additional guidelines:
- Assume the students are complete beginners. Avoid jargon and use plain language.
- Use humor or fun analogies when possible to make learning enjoyable.
- Always start with an example and explain it as if teaching a total novice.
- Provide tips for avoiding common mistakes beginners might make.
Examples of formatting:
- Use \`#\` for headings and section titles.
- Use Markdown for Python code, e.g.:
  \`\`\`python
  print("Hello, world!")
  \`\`\`
- Highlight key points with ***Note:*** to emphasize important information.
'
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            n_predict,
            stream
        }),
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer no-key' }
    });
    return response;
}

// POST endpoint to handle completion requests
app.post('/completion', async (req, res) => {
    const { prompt, n_predict, stream } = req.body;
    // Log the IP address of the client
    console.log('Client IP address:', req.ip);

    try {
        const response = await fetchCompletion(prompt, n_predict, stream);
        res.setHeader('Content-Type', 'text/plain'); // Set content type to plain text

        response.body.on('data', (chunk) => {
            const chunkString = chunk.toString();
            const lines = chunkString.split('\n').filter(line => line.trim() !== '');

            // Assuming each line is a JSON object, parse and extract content
            for (let line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonString = line.slice(6);
                    try {
                        const json = JSON.parse(jsonString);
                        if (json.choices && json.choices[0].delta.content) {
                            // Stream the plain text content back to the client
                            res.write(json.choices[0].delta.content);
                        }
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                }
            }
        });

        response.body.on('end', () => {
            res.end(); // End the response once the stream is complete
        });

    } catch (error) {
        console.error('Error fetching completion:', error);
        res.status(500).send('Error fetching completion');
    }
});


// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
