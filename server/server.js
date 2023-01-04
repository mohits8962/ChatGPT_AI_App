import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

// to be able to dotenv variables
dotenv.config();

// and then do configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, //passing here the openai key
});

// then create a instance of openai
const openai = new OpenAIApi(configuration); // and then passing that configuration function

// for initializing our express
const app = express();
app.use(cors()); // this allows us to make cross origin requests and allow our server to be called from the frontend
app.use(express.json()); // this will going to allow us to pass json from the frontend to backend


// for recieving the data from frontend
app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});


app.post("/", async (req, res) => {
  try {
    // getting the data from body of the frontend
    const prompt = req.body.prompt;

    // for getting response from openAi
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    // once we get the response we have to send it back to the frontend
    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});

// making sure the our server always listen to our requests
app.listen(5000, () =>
  console.log("AI server started on http://localhost:5000")
);
