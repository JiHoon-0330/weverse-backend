import axios from "axios";
import "dotenv/config";

const url = process.env.SLACK_WEBHOOK;
const [nodePath, filePath, ...args] = process.argv;

const slackNotify = () => {
  axios({
    url,
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    data: {
      text: args.join(" ... "),
    },
  });
};

slackNotify();
