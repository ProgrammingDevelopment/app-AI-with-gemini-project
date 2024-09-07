import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// Set your Gemini API key
const API_KEY = 'AIzaSyBY41IrlUCEUyXZz9fGDz0qKCBlJqrrVuE';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Load the image as a base64 string
    // let imageUrl = form.elements.namedItem('chosen-image').value;
    // let imageBase64 = await fetch(imageUrl)
      // .then(r => r.arrayBuffer())
      // .then(a => Base64.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          // { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          { text: promptInput.value }
        ]
      }
    ];

    // Initialize GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Call the model and generate content
    const result = await model.generateContentStream({ contents });

    // Interpret the output as markdown and render it
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (error) {
    console.error("Error during AI generation:", error);
    output.innerHTML = `<hr>Error: ${error.message}`;
  }
};

// Show the API key banner if needed
maybeShowApiKeyBanner(API_KEY);
