// /**
// This file contains the pseudocode for out routing algo.
// */
// boolean videoRdy = true;
// boolean audioRdy = true;
// int chatCount = 0, audioCount = 0, videoCount = 0;
// int audioRdyCount = 0 , videoRdyCount = 0;
// int chatQ, audioQ, videoQ;
// int fufilledRequests  = chatCount + audioCount + videoCount;
//
// while(true) {
//   if (chatQ!= 0 && chatCount !=0) {
//     // assign video request
//     if (videoQ != 0 && videoRdy) {
//       if (chatCount % 3 == 0) {
//         videoCount ++;
//         videoRdy = false; // reset after 3 chats have been served.
//         continue;
//       }
//     }
//
//     // assign audio request
//     if (audioQ != 0) {
//       if (chatCount % 2 = 0 && audioRdy) {
//         audioCount ++;
//         audioRdy = false;
//         continue;
//       }
//     }
//   }
//   // assign chat request
//   if (chatQ != 0) {
//     chatCount ++;
//     if (audioCount > 0) {
//       audioRdyCount ++;
//     }
//     if (videoCount > 0) {
//       videoRdyCount ++;
//     }
//
//     if (!audioRdy && audioRdyCount = 2) {
//       audioRdy = true;
//       audioRdyCount = 0;
//     }
//
//     if (!videoRdy && videoRdyCount = 3) {
//       videoRdy = true;
//       videoRdyCount = 0;
//     }
//   }
// }
