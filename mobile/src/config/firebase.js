/**
 * Firebase 설정 파일
 *
 * Firebase Console에서 발급받은 설정 정보를 입력하세요.
 * https://console.firebase.google.com → 프로젝트 설정 → 일반 → 내 앱 → 웹 앱
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBgrJ4lYcgOhkJWxJpFdKjD9gmse_ujTvg",
  authDomain: "ocean-seal.firebaseapp.com",
  projectId: "ocean-seal",
  storageBucket: "ocean-seal.firebasestorage.app",
  messagingSenderId: "46905295654",
  appId: "1:46905295654:web:cbfa6c36d0afd820bb77e7",
  measurementId: "G-YGYTGXHJ2J"
};



// 카카오 설정
export const kakaoConfig = {
  clientId: "ad75b6e87af9e6d4a9eb3c1f87e26cfe",  // REST API 키
};

// Google OAuth 설정 (Expo용)
export const googleConfig = {
  expoClientId: "46905295654-71oiinn5ais2ffe73tg3jfojvbad6li8.apps.googleusercontent.com",
  webClientId: "46905295654-71oiinn5ais2ffe73tg3jfojvbad6li8.apps.googleusercontent.com",
  iosClientId: "46905295654-71oiinn5ais2ffe73tg3jfojvbad6li8.apps.googleusercontent.com",
  androidClientId: null,
};
