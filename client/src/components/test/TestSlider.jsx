import React from 'react';
import ImageSlider from '../ui/ImageSlider';

const TestSlider = () => {
  const testImages = [
    {
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
      caption: 'Test Image 1'
    },
    {
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      caption: 'Test Image 2'
    }
  ];

  return (
    <div className="p-8">
      <h2 className="text-white text-xl mb-4">Test Image Slider</h2>
      <ImageSlider 
        images={testImages}
        autoPlay={true}
        autoPlayInterval={3000}
        showThumbnails={true}
        showControls={true}
        className="h-96"
      />
    </div>
  );
};

export default TestSlider;
