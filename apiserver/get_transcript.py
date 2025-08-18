# import the main class tool to get the transcript
from youtube_transcript_api import YouTubeTranscriptApi

# add video ID from youtube for what you want to extract
video_id = ""

# use video ID to get transcript
transcript = YouTubeTranscriptApi.get_transcript(video_id)

# providing variables for the quote
quote = []
elapsed = 0
start_after = 1
capture_limit = 150


for entry in transcript:
    # so it knows what to include in the transcript based on our above numbers given
    if elapsed < start_after:
        elapsed += entry['duration']
        continue

    quote.append(entry['text'])
    elapsed += entry['duration']
    # stopped after the desired time
    if elapsed > start_after + capture_limit:
        break

# make it all one string
final_quote = " ".join(quote)

# printing the final quote output in terminal
print("Extracted Quote:")
print(final_quote)
