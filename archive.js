
// const searchString = "java course";

// const requestParams = {
//   baseURL: `https://www.youtube.com`,
//   encodedQuery: encodeURI(searchString),                            // what we want to search for in URI encoding
// };

// async function fillPlaylistsDataFromPage(page) {
//   const dataFromPage = await page.evaluate((requestParams) => {
//     const mixes = Array.from(document.querySelectorAll("#contents > ytd-radio-renderer")).map((el) => ({
//       title: el.querySelector("a > h3 > #video-title")?.textContent.trim(),
//       link: `${requestParams.baseURL}${el.querySelector("a#thumbnail")?.getAttribute("href")}`,
//       videos: Array.from(el.querySelectorAll("ytd-child-video-renderer a")).map((el) => ({
//         title: el.querySelector("#video-title")?.textContent.trim(),
//         link: `${requestParams.baseURL}${el.getAttribute("href")}`,
//         length: el.querySelector("#length")?.textContent.trim(),
//       })),
//       thumbnail: el.querySelector("a#thumbnail #img")?.getAttribute("src"),
//     }));
//     const playlists = Array.from(document.querySelectorAll("#contents > ytd-playlist-renderer")).map((el) => ({
//       title: el.querySelector("a > h3 > #video-title")?.textContent.trim(),
//       link: `${requestParams.baseURL}${el.querySelector("a#thumbnail")?.getAttribute("href")}`,
//       channel: {
//         name: el.querySelector("#channel-name a")?.textContent.trim(),
//         link: `${requestParams.baseURL}${el.querySelector("#channel-name a")?.getAttribute("href")}`,
//       },
//       videoCount: el.querySelector("yt-formatted-string.ytd-thumbnail-overlay-side-panel-renderer")?.textContent.trim(),
//       videos: Array.from(el.querySelectorAll("ytd-child-video-renderer a")).map((el) => ({
//         title: el.querySelector("#video-title")?.textContent.trim(),
//         link: `${requestParams.baseURL}${el.getAttribute("href")}`,
//         length: el.querySelector("#length")?.textContent.trim(),
//       })),
//       thumbnail: el.querySelector("a#thumbnail #img")?.getAttribute("src"),
//     }));
//     return [...mixes, ...playlists];
//   }, requestParams);
//   return dataFromPage;
// }
