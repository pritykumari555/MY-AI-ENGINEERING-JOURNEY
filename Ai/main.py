
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="SmartLink AI")

# Groq client
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY missing in .env file")

client = Groq(api_key=api_key)


# Request body model
class LinkRequest(BaseModel):
    url: HttpUrl
    context: str = ""


# AI endpoint
@app.post("/ai-link-info")
async def ai_link_info(data: LinkRequest):
    try:
        url = str(data.url)

        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are SmartLink AI. "
                        "Suggest a likely category such as Jobs, Study, "
                        "Shopping, Social Media, or Other. "
                        "Give a short description based only on the URL "
                        "and user-provided context. "
                        "If uncertain, clearly say so. "
                        "Do not claim that you visited the webpage."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"URL: {url}\n"
                        f"User context: {data.context or 'Not provided'}"
                    )
                }
            ]
        )

        ai_info = completion.choices[0].message.content

        return {
            "success": True,
            "url": url,
            "aiInfo": ai_info
        }

    except Exception as error:
        print("Groq API error:", str(error))

        raise HTTPException(
            status_code=502,
            detail="AI link analysis failed. Please try again."
        )
