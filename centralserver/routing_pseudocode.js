// /**
// This file contains the pseudocode for out routing algo.
// */

// what is the input to this algo?
// from the current implementation, we already have a
// Here we need to match the videoQ, audioQ and chatQ.
// Before we assign the agents to these clients,
// we first have to implement add the requests to their specific queue types
// this queue will be alive as long as the server is alive.
// we will have a fixed cap on this to maintain the enqueued behavior as per before
// from these queue, we can then check how we pick these clients.
// after we are able to pick the client req,
// we then subject this req through our current algo to pick the agent


boolean videoRdy = true;
boolean audioRdy = true;
int chatCount = 0, audioCount = 0, videoCount = 0;
int audioRdyCount = 0 , videoRdyCount = 0;
int chatQ, audioQ, videoQ;
int fufilledRequests  = chatCount + audioCount + videoCount;

while(true) {
  if (chatQ!= 0 && chatCount !=0) {
    // assign video request
    if (videoQ != 0 && videoRdy) {
      if (chatCount % 3 == 0) {
        videoCount ++;
        videoRdy = false; // reset after 3 chats req have been served.
        continue;
      }
    }

    // assign audio request
    if (audioQ != 0) {
      if (chatCount % 2 = 0 && audioRdy) {
        audioCount ++;
        audioRdy = false; // reset after 2 chats req have been served.
        continue;
      }
    }
  }
  // assign chat request
  if (chatQ != 0) {
    chatCount ++;
    if (audioCount > 0) {
      audioRdyCount ++;
    }
    if (videoCount > 0) {
      videoRdyCount ++;
    }

    if (!audioRdy && audioRdyCount = 2) {
      audioRdy = true;
      audioRdyCount = 0;
    }

    if (!videoRdy && videoRdyCount = 3) {
      videoRdy = true;
      videoRdyCount = 0;
    }
  }
}
