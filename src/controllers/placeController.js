// src/controllers/placeController.js

const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.MAPS_API_KEY;

exports.getStore = async (req, res) => {
  try {
    
    const { userLatitude, userLongitude, keyword, radius, minRating, isOpened, minPrice, maxPrice, category, type } = req.body;
  console.error(req.body);
    if (
      !userLatitude ||
      !userLongitude ||
      !keyword
    ) {
      return res.status(400).json({ status: 'error', message: 'Invalid input parameters' });
    }

    const params = new URLSearchParams({
      location: `${userLatitude},${userLongitude}`,
      radius: radius,
      keyword,
      key: apiKey,
    });

    if (minRating) {
      params.append('min_rating', minRating);
    }

    if (isOpened) {
      params.append('opennow', true);
    }

    if (minPrice) {
      params.append('min_price', minPrice);
    }

    if (maxPrice) {
      params.append('max_price', maxPrice);
    }

    if (category) {
      params.append('category', category);
    }

    if (type) {
      params.append('type', type);
    }

    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const response = await axios.get(apiUrl);
    const places = response.data.results;

    const origin = `${userLatitude},${userLongitude}`;
    const placesWithDetails = await Promise.all(
      places.map(async (place) => {
        const destination = `${place.geometry.location.lat},${place.geometry.location.lng}`;
        const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${apiKey}`;

        const distanceMatrixResponse = await axios.get(distanceMatrixUrl);
        const distanceMatrix = distanceMatrixResponse.data;

        const photos = place.photos ? place.photos.map(photo => ({
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photoreference=${photo.photo_reference}&key=${apiKey}`,
          height: photo.height,
          width: photo.width,
        })) : [];

        const store = {
          place: {
            ...place,
            photos,
          },
          distance: distanceMatrix.rows[0].elements[0].distance.text,
          duration: distanceMatrix.rows[0].elements[0].duration.text,
        };

        return store;
      })
    );

    res.status(200).json({
      status: 'success',
      data: placesWithDetails,
      nextPageToken: response.data.next_page_token,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getNextStore = async (req, res) => {
  try {
  const { userLatitude, userLongitude, nextPageToken } = req.body;

console.error(req.body);
  if (
    !userLatitude ||
    !userLongitude ||
    !nextPageToken
  ) {
    return res.status(400).json({ status: 'error', message: 'Invalid input parameters' });
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
  const response = await axios.get(apiUrl);
    const places = response.data.results;

    const origin = `${userLatitude},${userLongitude}`;
    const placesWithDetails = await Promise.all(
      places.map(async (place) => {
        const destination = `${place.geometry.location.lat},${place.geometry.location.lng}`;
        const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${apiKey}`;

        const distanceMatrixResponse = await axios.get(distanceMatrixUrl);
        const distanceMatrix = distanceMatrixResponse.data;

        const photos = place.photos ? place.photos.map(photo => ({
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photoreference=${photo.photo_reference}&key=${apiKey}`,
          height: photo.height,
          width: photo.width,
        })) : [];

        const store = {
          place: {
            ...place,
            photos,
          },
          distance: distanceMatrix.rows[0].elements[0].distance.text,
          duration: distanceMatrix.rows[0].elements[0].duration.text,
        };

        return store;
      })
    );

    res.status(200).json({
      status: 'success',
      data: placesWithDetails,
      nextPageToken: response.data.next_page_token,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getStoreDetails = async (req, res) => {
  try {
    const { idPlace } = req.body;
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: idPlace,
        key: apiKey,
      },
    });

    const placeDetails = response.data.result;

    // Extract image URLs, if available
    const photoUrls = placeDetails.photos?.map((photo) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...placeDetails,
        photoUrls,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};