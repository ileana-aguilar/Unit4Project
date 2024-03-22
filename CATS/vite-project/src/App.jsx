import { useState, useEffect } from 'react';
import './App.css';

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

const App = () => {
  const [breeds, setBreeds] = useState([]);
  const [catImage, setCatImage] = useState(null);
  const [breedDetails, setBreedDetails] = useState({ name: '', weight: '', life_span: ''});
  const [banList, setBanList] = useState([]);

  useEffect(() => {
    const fetchBreeds = async () => {
      const response = await fetch(`https://api.thecatapi.com/v1/breeds?api_key=${ACCESS_KEY}`);
      const data = await response.json();
      setBreeds(data);
    };

    fetchBreeds();
  }, []);

  const fetchCatDetails = async () => {
    if (breeds.length === 0) return;

    let attempt = 0; // To prevent infinite loops
    let foundValidBreed = false;
    let data = null;

    while (!foundValidBreed && attempt < breeds.length) {
      const randomBreedIndex = Math.floor(Math.random() * breeds.length);
      const selectedBreed = breeds[randomBreedIndex];

      const query = `https://api.thecatapi.com/v1/images/search?breed_ids=${selectedBreed.id}&api_key=${ACCESS_KEY}`;
      const response = await fetch(query);
      data = await response.json();

      if (data.length > 0 && data[0].breeds && data[0].breeds.length > 0) {
        const breed = data[0].breeds[0];
        // Check if breed details match anything in the ban list
        if (!banList.includes(breed.name) && !banList.includes(breed.weight.imperial) && !banList.includes(breed.life_span)) {
          foundValidBreed = true;
          setCatImage(data[0].url);
          setBreedDetails({
            name: breed.name,
            weight: breed.weight.imperial,
            life_span: breed.life_span
          });
        }
      }
      attempt++;
    }

    if (!foundValidBreed) {
      alert("Failed to find an un-banned breed. Consider resetting the ban list.");
    }
  };

  const addToBanList = (attribute) => {
    if (!banList.includes(attribute)) {
      setBanList([...banList, attribute]);
    }
  };

  return (
    <>
      <h1>Discover Cool Cats</h1>
      {catImage && (
        <div>
          <img src={catImage} title={breedDetails.name} alt={breedDetails.name} style={{ width: '400px' }} />
            <div>
              <p>Attributes of a {breedDetails.name}:</p>
              <button onClick={() => addToBanList(breedDetails.name)}>{breedDetails.name}</button>
              <button onClick={() => addToBanList(breedDetails.weight)}>{breedDetails.weight} lbs</button>
              <button onClick={() => addToBanList(breedDetails.life_span)}>{breedDetails.life_span} years</button>
            </div>
        </div>
      )}
      <button onClick={fetchCatDetails}> Discover New Cat! </button>
      <div>
        <h1>Ban List</h1>
        <p>Select an attribute to ban it</p>
          {banList.map((item, index) => (
            <button key={index}>{item}</button>
          ))}
      </div>
    </>
  );
}

export default App;
