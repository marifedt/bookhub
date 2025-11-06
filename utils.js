import axios from 'axios';

//Check Image if it exists
export const preloadImage = (url) => {
  return axios
    .head(url)
    .then((response) => {
      return { url, valid: true };
    })
    .catch((error) => {
      return { url: '', valid: false };
    });
};

export const capitalizeWords = (str) => {
  if (!str) return '';

  const words = str.split(' ');

  const capitalizedWords = words.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1);
    return firstLetter + restOfWord;
  });

  return capitalizedWords.join(' ');
};

export const formatDate = (dateValue) => {
    if(!dateValue) return 'Unknown Date';

    const date = new Date(dateValue);

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};